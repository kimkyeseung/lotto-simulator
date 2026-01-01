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
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (cache retention)
  })
}
