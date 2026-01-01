export interface Author {
  id: string
  clerkId: string
  username: string | null
  imageUrl: string | null
}

export interface Comment {
  id: string
  content: string
  parentId: string | null
  createdAt: string
  updatedAt: string
  author: Author | null
  likeCount: number
  replies?: Comment[]
}

export interface CreateCommentInput {
  userId: string
  content: string
  parentId?: string
}

export interface UpdateCommentInput {
  content: string
  userId: string
}

export interface ToggleLikeInput {
  userId: string
  targetId: string
  targetType: 'comment' | 'simulation'
}
