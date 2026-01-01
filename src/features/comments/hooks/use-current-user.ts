import { useUser } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { syncUser, getUserByClerkId } from '../api'

export function useCurrentUser() {
  const { user, isLoaded, isSignedIn } = useUser()

  const { data: dbUser, isLoading } = useQuery({
    queryKey: ['currentUser', user?.id],
    queryFn: async () => {
      if (!user) return null

      // Try to get existing user
      let dbUser = await getUserByClerkId(user.id)

      // If not found, sync/create user
      if (!dbUser) {
        dbUser = await syncUser(
          user.id,
          user.username || user.firstName || undefined,
          user.imageUrl
        )
      }

      return dbUser
    },
    enabled: isLoaded && isSignedIn && !!user,
  })

  return {
    clerkUser: user,
    dbUser,
    isLoaded,
    isSignedIn,
    isLoading: !isLoaded || isLoading,
  }
}
