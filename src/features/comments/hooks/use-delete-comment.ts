import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteComment } from '../api'
import { commentsKeys } from './use-comments'

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      deleteComment(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.lists() })
    },
  })
}
