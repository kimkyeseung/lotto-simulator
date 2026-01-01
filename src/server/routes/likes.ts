import { Hono } from 'hono'
import { and, eq, sql } from 'drizzle-orm'
import { db, likes } from '@/db'

export const likesRoute = new Hono()

// Toggle like (add or remove)
likesRoute.post('/toggle', async (c) => {
  try {
    const body = await c.req.json<{
      userId: string
      targetId: string
      targetType: 'comment' | 'simulation'
    }>()

    if (!body.userId || !body.targetId || !body.targetType) {
      return c.json({ error: 'userId, targetId, and targetType are required' }, 400)
    }

    // Check if like exists
    const existingLike = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, body.userId),
          eq(likes.targetId, body.targetId),
          eq(likes.targetType, body.targetType)
        )
      )
      .limit(1)

    if (existingLike.length > 0) {
      // Remove like
      await db
        .delete(likes)
        .where(
          and(
            eq(likes.userId, body.userId),
            eq(likes.targetId, body.targetId),
            eq(likes.targetType, body.targetType)
          )
        )

      return c.json({ liked: false })
    }

    // Add like
    await db.insert(likes).values({
      userId: body.userId,
      targetId: body.targetId,
      targetType: body.targetType,
    })

    return c.json({ liked: true })
  } catch (error) {
    console.error('Error toggling like:', error)
    return c.json({ error: 'Failed to toggle like' }, 500)
  }
})

// Get like count for a target
likesRoute.get('/count/:targetType/:targetId', async (c) => {
  try {
    const targetType = c.req.param('targetType') as 'comment' | 'simulation'
    const targetId = c.req.param('targetId')

    const result = await db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(likes)
      .where(
        and(
          eq(likes.targetId, targetId),
          eq(likes.targetType, targetType)
        )
      )

    return c.json({ count: result[0]?.count || 0 })
  } catch (error) {
    console.error('Error getting like count:', error)
    return c.json({ error: 'Failed to get like count' }, 500)
  }
})

// Check if user liked a target
likesRoute.get('/check/:targetType/:targetId/:userId', async (c) => {
  try {
    const targetType = c.req.param('targetType') as 'comment' | 'simulation'
    const targetId = c.req.param('targetId')
    const userId = c.req.param('userId')

    const existingLike = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.targetId, targetId),
          eq(likes.targetType, targetType)
        )
      )
      .limit(1)

    return c.json({ liked: existingLike.length > 0 })
  } catch (error) {
    console.error('Error checking like:', error)
    return c.json({ error: 'Failed to check like' }, 500)
  }
})

// Get all likes by user
likesRoute.get('/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')

    const userLikes = await db
      .select()
      .from(likes)
      .where(eq(likes.userId, userId))

    return c.json(userLikes)
  } catch (error) {
    console.error('Error getting user likes:', error)
    return c.json({ error: 'Failed to get user likes' }, 500)
  }
})
