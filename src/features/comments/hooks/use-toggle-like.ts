import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleLike } from '../api'
import { commentsKeys } from './use-comments'
import type { ToggleLikeInput } from '../types'

export const likesKeys = {
  all: ['likes'] as const,
  user: (userId: string) => [...likesKeys.all, 'user', userId] as const,
}

export function useToggleLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ToggleLikeInput) => toggleLike(input),
    onSuccess: () => {
      // Invalidate comments to update like counts
      queryClient.invalidateQueries({ queryKey: commentsKeys.lists() })
    },
  })
}
