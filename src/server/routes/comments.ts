import { Hono } from 'hono'
import { eq, desc, isNull } from 'drizzle-orm'
import { db, comments, users } from '@/db'

export const commentsRoute = new Hono()

// Get all comments with author info (optimized - single query)
commentsRoute.get('/', async (c) => {
  try {
    // Fetch all comments in a single query
    const allComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        author: {
          id: users.id,
          clerkId: users.clerkId,
          username: users.username,
          imageUrl: users.imageUrl,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .orderBy(desc(comments.createdAt))

    // Build tree structure in memory
    type CommentWithReplies = typeof allComments[number] & {
      likeCount: number
      replies: CommentWithReplies[]
    }

    const commentMap = new Map<string, CommentWithReplies>()
    const topLevelComments: CommentWithReplies[] = []

    // First pass: create all comment objects
    allComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, likeCount: 0, replies: [] })
    })

    // Second pass: build tree structure
    allComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.replies.push(commentWithReplies)
        }
      } else {
        topLevelComments.push(commentWithReplies)
      }
    })

    // Sort replies by createdAt ascending
    topLevelComments.forEach((comment) => {
      comment.replies.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    })

    return c.json(topLevelComments)
  } catch (error) {
    console.error('Error getting comments:', error)
    return c.json({ error: 'Failed to get comments' }, 500)
  }
})

// Create a new comment
commentsRoute.post('/', async (c) => {
  try {
    const body = await c.req.json<{
      userId: string // DB user id
      content: string
      parentId?: string
    }>()

    if (!body.userId || !body.content) {
      return c.json({ error: 'userId and content are required' }, 400)
    }

    const newComment = await db
      .insert(comments)
      .values({
        userId: body.userId,
        content: body.content,
        parentId: body.parentId || null,
      })
      .returning()

    // Get author info
    const author = await db
      .select()
      .from(users)
      .where(eq(users.id, body.userId))
      .limit(1)

    return c.json({
      ...newComment[0],
      author: author[0] || null,
      likeCount: 0,
      replies: [],
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return c.json({ error: 'Failed to create comment' }, 500)
  }
})

// Update a comment
commentsRoute.put('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json<{
      content: string
      userId: string // For authorization check
    }>()

    if (!body.content) {
      return c.json({ error: 'content is required' }, 400)
    }

    // Check if the comment belongs to the user
    const existingComment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1)

    if (existingComment.length === 0) {
      return c.json({ error: 'Comment not found' }, 404)
    }

    if (existingComment[0].userId !== body.userId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    const updated = await db
      .update(comments)
      .set({ content: body.content })
      .where(eq(comments.id, id))
      .returning()

    return c.json(updated[0])
  } catch (error) {
    console.error('Error updating comment:', error)
    return c.json({ error: 'Failed to update comment' }, 500)
  }
})

// Delete a comment
commentsRoute.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.req.query('userId')

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400)
    }

    // Check if the comment belongs to the user
    const existingComment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1)

    if (existingComment.length === 0) {
      return c.json({ error: 'Comment not found' }, 404)
    }

    if (existingComment[0].userId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    await db.delete(comments).where(eq(comments.id, id))

    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return c.json({ error: 'Failed to delete comment' }, 500)
  }
})
