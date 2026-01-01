import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToggleLike, useCurrentUser } from '../hooks'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  targetId: string
  targetType: 'comment' | 'simulation'
  initialLikeCount: number
  initialLiked?: boolean
  size?: 'sm' | 'default'
}

export function LikeButton({
  targetId,
  targetType,
  initialLikeCount,
  initialLiked = false,
  size = 'sm',
}: LikeButtonProps) {
  const { dbUser, isSignedIn } = useCurrentUser()
  const toggleLike = useToggleLike()

  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)

  const handleToggle = async () => {
    if (!isSignedIn || !dbUser) return

    // Optimistic update
    const wasLiked = liked
    setLiked(!liked)
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1))

    try {
      await toggleLike.mutateAsync({
        userId: dbUser.id,
        targetId,
        targetType,
      })
    } catch {
      // Rollback on error
      setLiked(wasLiked)
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1))
    }
  }

  return (
    <Button
      variant='ghost'
      size={size}
      onClick={handleToggle}
      disabled={!isSignedIn || toggleLike.isPending}
      className={cn(
        'gap-1.5',
        liked && 'text-red-500 hover:text-red-600'
      )}
    >
      <Heart
        className={cn(
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          liked && 'fill-current'
        )}
      />
      <span className='text-xs'>{likeCount}</span>
    </Button>
  )
}
