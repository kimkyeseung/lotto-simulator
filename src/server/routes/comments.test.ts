import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { commentsRoute } from './comments'

// Mock the database module
vi.mock('@/db', () => {
  const mockDb = {
    select: vi.fn(() => mockDb),
    from: vi.fn(() => mockDb),
    leftJoin: vi.fn(() => mockDb),
    where: vi.fn(() => mockDb),
    orderBy: vi.fn(() => mockDb),
    limit: vi.fn(() => mockDb),
    insert: vi.fn(() => mockDb),
    values: vi.fn(() => mockDb),
    returning: vi.fn(() => Promise.resolve([])),
    update: vi.fn(() => mockDb),
    set: vi.fn(() => mockDb),
    delete: vi.fn(() => mockDb),
  }

  return {
    db: mockDb,
    comments: {
      id: 'id',
      content: 'content',
      parentId: 'parentId',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      userId: 'userId',
    },
    users: {
      id: 'id',
      clerkId: 'clerkId',
      username: 'username',
      imageUrl: 'imageUrl',
    },
  }
})

// Import after mocking
import { db, comments, users } from '@/db'

describe('Comments API Routes', () => {
  let app: Hono

  beforeEach(() => {
    vi.clearAllMocks()
    app = new Hono()
    app.route('/comments', commentsRoute)
  })

  describe('GET /comments', () => {
    it('should return empty array when no comments exist', async () => {
      // Mock the database to return empty array (single query - optimized)
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/comments')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should return comments with author info', async () => {
      const mockComments = [
        {
          id: '123',
          content: 'Test comment',
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: 'user-1',
            clerkId: 'clerk-1',
            username: 'testuser',
            imageUrl: 'https://example.com/avatar.png',
          },
        },
      ]

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockComments),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/comments')
      expect(res.status).toBe(200)
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/comments')
      expect(res.status).toBe(500)

      const data = await res.json()
      expect(data.error).toBe('Failed to get comments')
    })
  })

  describe('POST /comments', () => {
    it('should return 400 if userId is missing', async () => {
      const res = await app.request('/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Test comment' }),
      })

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('userId and content are required')
    })

    it('should return 400 if content is missing', async () => {
      const res = await app.request('/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-1' }),
      })

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('userId and content are required')
    })

    it('should create a new comment successfully', async () => {
      const newComment = {
        id: 'new-comment-id',
        userId: 'user-1',
        content: 'New test comment',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const author = {
        id: 'user-1',
        clerkId: 'clerk-1',
        username: 'testuser',
        imageUrl: 'https://example.com/avatar.png',
      }

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newComment]),
        }),
      } as unknown as ReturnType<typeof db.insert>)

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([author]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
          content: 'New test comment',
        }),
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.content).toBe('New test comment')
      expect(data.likeCount).toBe(0)
      expect(data.replies).toEqual([])
    })

    it('should create a reply comment with parentId', async () => {
      const reply = {
        id: 'reply-id',
        userId: 'user-1',
        content: 'This is a reply',
        parentId: 'parent-comment-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([reply]),
        }),
      } as unknown as ReturnType<typeof db.insert>)

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'user-1', username: 'testuser' }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
          content: 'This is a reply',
          parentId: 'parent-comment-id',
        }),
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.parentId).toBe('parent-comment-id')
    })
  })

  describe('PUT /comments/:id', () => {
    it('should return 400 if content is missing', async () => {
      const res = await app.request('/comments/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-1' }),
      })

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('content is required')
    })

    it('should return 404 if comment not found', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/comments/non-existent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Updated content', userId: 'user-1' }),
      })

      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data.error).toBe('Comment not found')
    })

    it('should return 403 if user is not the owner', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: '123', userId: 'other-user' }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/comments/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Updated content', userId: 'user-1' }),
      })

      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should update comment successfully', async () => {
      const existingComment = { id: '123', userId: 'user-1', content: 'Old content' }
      const updatedComment = { id: '123', userId: 'user-1', content: 'Updated content' }

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existingComment]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedComment]),
          }),
        }),
      } as unknown as ReturnType<typeof db.update>)

      const res = await app.request('/comments/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Updated content', userId: 'user-1' }),
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.content).toBe('Updated content')
    })
  })

  describe('DELETE /comments/:id', () => {
    it('should return 400 if userId is missing', async () => {
      const res = await app.request('/comments/123', {
        method: 'DELETE',
      })

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('userId is required')
    })

    it('should return 404 if comment not found', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/comments/non-existent?userId=user-1', {
        method: 'DELETE',
      })

      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data.error).toBe('Comment not found')
    })

    it('should return 403 if user is not the owner', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: '123', userId: 'other-user' }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      const res = await app.request('/comments/123?userId=user-1', {
        method: 'DELETE',
      })

      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should delete comment successfully', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: '123', userId: 'user-1' }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>)

      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as unknown as ReturnType<typeof db.delete>)

      const res = await app.request('/comments/123?userId=user-1', {
        method: 'DELETE',
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
    })
  })
})
