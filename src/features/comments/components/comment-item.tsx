import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MoreHorizontal, Pencil, Trash2, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LikeButton } from './like-button'
import { CommentForm } from './comment-form'
import { useUpdateComment, useDeleteComment, useCurrentUser } from '../hooks'
import type { Comment } from '../types'
import { cn } from '@/lib/utils'

interface CommentItemProps {
  comment: Comment
  isReply?: boolean
}

export function CommentItem({ comment, isReply = false }: CommentItemProps) {
  const { dbUser } = useCurrentUser()
  const updateComment = useUpdateComment()
  const deleteComment = useDeleteComment()

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isReplying, setIsReplying] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isOwner = dbUser?.id === comment.author?.id

  const handleUpdate = async () => {
    if (!editContent.trim() || !dbUser) return

    try {
      await updateComment.mutateAsync({
        id: comment.id,
        input: {
          content: editContent.trim(),
          userId: dbUser.id,
        },
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update comment:', error)
    }
  }

  const handleDelete = async () => {
    if (!dbUser) return

    try {
      await deleteComment.mutateAsync({
        id: comment.id,
        userId: dbUser.id,
      })
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: ko,
  })

  return (
    <div className={cn('flex gap-3', isReply && 'ml-11')}>
      <Avatar className='h-8 w-8 shrink-0'>
        <AvatarImage
          src={comment.author?.imageUrl || undefined}
          alt={comment.author?.username || ''}
        />
        <AvatarFallback>
          {comment.author?.username?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className='flex-1 space-y-1'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>
            {comment.author?.username || '익명'}
          </span>
          <span className='text-muted-foreground text-xs'>{timeAgo}</span>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='h-6 w-6'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  수정
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className='text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <div className='space-y-2'>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className='min-h-[60px] resize-none'
            />
            <div className='flex gap-2'>
              <Button
                size='sm'
                onClick={handleUpdate}
                disabled={!editContent.trim() || updateComment.isPending}
              >
                저장
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                }}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <p className='text-sm whitespace-pre-wrap'>{comment.content}</p>
        )}

        <div className='flex items-center gap-2'>
          <LikeButton
            targetId={comment.id}
            targetType='comment'
            initialLikeCount={comment.likeCount}
          />
          {!isReply && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsReplying(!isReplying)}
              className='gap-1.5'
            >
              <MessageSquare className='h-4 w-4' />
              <span className='text-xs'>답글</span>
            </Button>
          )}
        </div>

        {isReplying && (
          <div className='mt-2'>
            <CommentForm
              parentId={comment.id}
              onSuccess={() => setIsReplying(false)}
              placeholder='답글을 입력하세요...'
              autoFocus
            />
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className='mt-3 space-y-3'>
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
