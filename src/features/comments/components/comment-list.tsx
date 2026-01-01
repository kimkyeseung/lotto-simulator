import { MessageSquare } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentItem } from './comment-item'
import { CommentForm } from './comment-form'
import { useComments } from '../hooks'

export function CommentList() {
  const { data: comments, isLoading, error } = useComments()

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-muted-foreground flex flex-col items-center justify-center py-8'>
        <p className='text-sm'>댓글을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <CommentForm />

      {comments && comments.length > 0 ? (
        <div className='space-y-4'>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className='text-muted-foreground flex flex-col items-center justify-center py-8'>
          <MessageSquare className='mb-2 h-8 w-8' />
          <p className='text-sm'>아직 댓글이 없습니다.</p>
          <p className='text-xs'>첫 번째 댓글을 남겨보세요!</p>
        </div>
      )}
    </div>
  )
}

function CommentSkeleton() {
  return (
    <div className='flex gap-3'>
      <Skeleton className='h-8 w-8 rounded-full' />
      <div className='flex-1 space-y-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-16 w-full' />
        <div className='flex gap-2'>
          <Skeleton className='h-6 w-12' />
          <Skeleton className='h-6 w-12' />
        </div>
      </div>
    </div>
  )
}
