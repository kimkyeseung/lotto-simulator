import { useState } from 'react'
import { Send } from 'lucide-react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCreateComment, useCurrentUser } from '../hooks'

interface CommentFormProps {
  parentId?: string
  onSuccess?: () => void
  placeholder?: string
  autoFocus?: boolean
}

export function CommentForm({
  parentId,
  onSuccess,
  placeholder = '댓글을 입력하세요...',
  autoFocus = false,
}: CommentFormProps) {
  const { clerkUser, dbUser, isLoading } = useCurrentUser()
  const createComment = useCreateComment()
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !dbUser) return

    try {
      await createComment.mutateAsync({
        userId: dbUser.id,
        content: content.trim(),
        parentId,
      })
      setContent('')
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  return (
    <div className='flex gap-3'>
      <SignedIn>
        <Avatar className='h-8 w-8 shrink-0'>
          <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.username || ''} />
          <AvatarFallback>
            {clerkUser?.firstName?.[0] || clerkUser?.username?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <form onSubmit={handleSubmit} className='flex flex-1 gap-2'>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className='min-h-[60px] flex-1 resize-none'
            disabled={isLoading || createComment.isPending}
          />
          <Button
            type='submit'
            size='icon'
            disabled={!content.trim() || isLoading || createComment.isPending}
          >
            <Send className='h-4 w-4' />
          </Button>
        </form>
      </SignedIn>
      <SignedOut>
        <div className='bg-muted/50 flex w-full items-center justify-center rounded-lg p-4'>
          <p className='text-muted-foreground text-sm'>
            댓글을 작성하려면{' '}
            <SignInButton mode='modal'>
              <button className='text-primary underline underline-offset-4'>
                로그인
              </button>
            </SignInButton>
            이 필요합니다.
          </p>
        </div>
      </SignedOut>
    </div>
  )
}
