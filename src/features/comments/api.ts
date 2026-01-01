import axios from 'axios'
import type { Comment, CreateCommentInput, UpdateCommentInput, ToggleLikeInput } from './types'

const API_BASE = '/api'

// Comments API
export async function getComments(): Promise<Comment[]> {
  const response = await axios.get(`${API_BASE}/comments`)
  return response.data
}

export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const response = await axios.post(`${API_BASE}/comments`, input)
  return response.data
}

export async function updateComment(id: string, input: UpdateCommentInput): Promise<Comment> {
  const response = await axios.put(`${API_BASE}/comments/${id}`, input)
  return response.data
}

export async function deleteComment(id: string, userId: string): Promise<void> {
  await axios.delete(`${API_BASE}/comments/${id}?userId=${userId}`)
}

// Likes API
export async function toggleLike(input: ToggleLikeInput): Promise<{ liked: boolean }> {
  const response = await axios.post(`${API_BASE}/likes/toggle`, input)
  return response.data
}

export async function getLikeCount(targetType: 'comment' | 'simulation', targetId: string): Promise<number> {
  const response = await axios.get(`${API_BASE}/likes/count/${targetType}/${targetId}`)
  return response.data.count
}

export async function checkLiked(
  targetType: 'comment' | 'simulation',
  targetId: string,
  userId: string
): Promise<boolean> {
  const response = await axios.get(`${API_BASE}/likes/check/${targetType}/${targetId}/${userId}`)
  return response.data.liked
}

export async function getUserLikes(userId: string): Promise<Array<{
  targetId: string
  targetType: 'comment' | 'simulation'
}>> {
  const response = await axios.get(`${API_BASE}/likes/user/${userId}`)
  return response.data
}

// Users API
export async function syncUser(clerkId: string, username?: string, imageUrl?: string): Promise<{
  id: string
  clerkId: string
  username: string | null
  imageUrl: string | null
}> {
  const response = await axios.post(`${API_BASE}/users/sync`, {
    clerkId,
    username,
    imageUrl,
  })
  return response.data
}

export async function getUserByClerkId(clerkId: string): Promise<{
  id: string
  clerkId: string
  username: string | null
  imageUrl: string | null
} | null> {
  try {
    const response = await axios.get(`${API_BASE}/users/clerk/${clerkId}`)
    return response.data
  } catch {
    return null
  }
}
