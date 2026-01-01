import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateComment } from '../api'
import { commentsKeys } from './use-comments'
import type { UpdateCommentInput } from '../types'

export function useUpdateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCommentInput }) =>
      updateComment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.lists() })
    },
  })
}
