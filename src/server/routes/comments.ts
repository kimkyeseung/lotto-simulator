import { Hono } from 'hono'
import { eq, desc, isNull } from 'drizzle-orm'
import { db, comments, users } from '@/db'

export const commentsRoute = new Hono()

// Get all comments with author info
commentsRoute.get('/', async (c) => {
  try {
    const result = await db
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
      .where(isNull(comments.parentId)) // Only top-level comments
      .orderBy(desc(comments.createdAt))

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      result.map(async (comment) => {
        const replies = await db
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
          .where(eq(comments.parentId, comment.id))
          .orderBy(comments.createdAt)

        return { ...comment, likeCount: 0, replies: replies.map(r => ({ ...r, likeCount: 0 })) }
      })
    )

    return c.json(commentsWithReplies)
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
