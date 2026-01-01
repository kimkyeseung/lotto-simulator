import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createComment } from '../api'
import { commentsKeys } from './use-comments'
import type { CreateCommentInput } from '../types'

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCommentInput) => createComment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.lists() })
    },
  })
}
