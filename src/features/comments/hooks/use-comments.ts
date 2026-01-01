import { useQuery } from '@tanstack/react-query'
import { getComments } from '../api'

export const commentsKeys = {
  all: ['comments'] as const,
  lists: () => [...commentsKeys.all, 'list'] as const,
}

export function useComments() {
  return useQuery({
    queryKey: commentsKeys.lists(),
    queryFn: getComments,
  })
}
