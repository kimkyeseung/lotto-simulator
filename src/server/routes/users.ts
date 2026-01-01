import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db, users } from '@/db'

export const usersRoute = new Hono()

// Sync or create user from Clerk
usersRoute.post('/sync', async (c) => {
  try {
    const body = await c.req.json<{
      clerkId: string
      username?: string
      imageUrl?: string
    }>()

    if (!body.clerkId) {
      return c.json({ error: 'clerkId is required' }, 400)
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, body.clerkId))
      .limit(1)

    if (existingUser.length > 0) {
      // Update existing user
      const updated = await db
        .update(users)
        .set({
          username: body.username,
          imageUrl: body.imageUrl,
        })
        .where(eq(users.clerkId, body.clerkId))
        .returning()

      return c.json(updated[0])
    }

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        clerkId: body.clerkId,
        username: body.username,
        imageUrl: body.imageUrl,
      })
      .returning()

    return c.json(newUser[0])
  } catch (error) {
    console.error('Error syncing user:', error)
    return c.json({ error: 'Failed to sync user' }, 500)
  }
})

// Get user by Clerk ID
usersRoute.get('/clerk/:clerkId', async (c) => {
  try {
    const clerkId = c.req.param('clerkId')

    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1)

    if (user.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json(user[0])
  } catch (error) {
    console.error('Error getting user:', error)
    return c.json({ error: 'Failed to get user' }, 500)
  }
})
