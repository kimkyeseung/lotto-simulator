import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { likesRoute } from './likes'

// Mock the database module
vi.mock('@/db', () => {
  const mockDb = {
    select: vi.fn(() => mockDb),
    from: vi.fn(() => mockDb),
    where: vi.fn(() => mockDb),
    limit: vi.fn(() => Promise.resolve([])),
    insert: vi.fn(() => mockDb),
    values: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => mockDb),
  }

  return {
    db: mockDb,
    likes: {
      userId: 'userId',
      targetId: 'targetId',
      targetType: 'targetType',
      createdAt: 'createdAt',
    },
  }
})

// Import after mocking
import { db, likes } from '@/db'

describe('Likes API Routes', () => {
  let app: Hono

  beforeEach(() => {
    vi.clearAllMocks()
    app = new Hono()
    app.route('/likes', likesRoute)
  })

  describe('POST /likes/toggle', () => {
    it('should return 400 if userId is missing', async () => {
      const res = await app.request('/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: 'comment-1',
          targetType: 'comment',
        }),
      })

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('userId, targetId, and targetType are required')
    })

    it('should return 400 if targetId is missing', async () => {
      const res = await app.request('/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
          targetType: 'comment',
        }),
      })

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('userId, targetId, and targetType are required')
    })

    it('should return 400 if targetType is missing', async () => {
      const res = await app.request('/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
          targetId: 'comment-1',
        }),
      })

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('userId, targetId, and targetType are required')
    })

    it('should add like when it does not exist', async () => {
      // Mock: like does not exist
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as unknown as ReturnType<typeof db.insert>)

      const res = await app.request('/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
          targetId: 'comment-1',
          targetType: 'comment',
        }),
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.liked).toBe(true)
    })

    it('should remove like when it already exists', async () => {
      // Mock: like exists
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ userId: 'user-1', targetId: 'comment-1' }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as unknown as ReturnType<typeof db.delete>)

      const res = await app.request('/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
          targetId: 'comment-1',
          targetType: 'comment',
        }),
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.liked).toBe(false)
    })

    it('should handle simulation target type', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as unknown as ReturnType<typeof db.insert>)

      const res = await app.request('/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
          targetId: 'simulation-1',
          targetType: 'simulation',
        }),
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.liked).toBe(true)
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
          targetId: 'comment-1',
          targetType: 'comment',
        }),
      })

      expect(res.status).toBe(500)
      const data = await res.json()
      expect(data.error).toBe('Failed to toggle like')
    })
  })

  describe('GET /likes/count/:targetType/:targetId', () => {
    it('should return like count for a comment', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 5 }]),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/likes/count/comment/comment-1')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.count).toBe(5)
    })

    it('should return 0 when no likes exist', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/likes/count/comment/comment-1')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.count).toBe(0)
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/likes/count/comment/comment-1')
      expect(res.status).toBe(500)

      const data = await res.json()
      expect(data.error).toBe('Failed to get like count')
    })
  })

  describe('GET /likes/check/:targetType/:targetId/:userId', () => {
    it('should return liked: true when user has liked', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ userId: 'user-1', targetId: 'comment-1' }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/likes/check/comment/comment-1/user-1')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.liked).toBe(true)
    })

    it('should return liked: false when user has not liked', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/likes/check/comment/comment-1/user-1')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.liked).toBe(false)
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/likes/check/comment/comment-1/user-1')
      expect(res.status).toBe(500)

      const data = await res.json()
      expect(data.error).toBe('Failed to check like')
    })
  })

  describe('GET /likes/user/:userId', () => {
    it('should return all likes for a user', async () => {
      const userLikes = [
        { userId: 'user-1', targetId: 'comment-1', targetType: 'comment' },
        { userId: 'user-1', targetId: 'simulation-1', targetType: 'simulation' },
      ]

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(userLikes),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/likes/user/user-1')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveLength(2)
      expect(data[0].targetType).toBe('comment')
      expect(data[1].targetType).toBe('simulation')
    })

    it('should return empty array when user has no likes', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/likes/user/user-1')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/likes/user/user-1')
      expect(res.status).toBe(500)

      const data = await res.json()
      expect(data.error).toBe('Failed to get user likes')
    })
  })
})
