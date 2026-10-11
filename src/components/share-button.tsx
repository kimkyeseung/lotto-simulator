import { ImageDown, Link2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  buildShareUrl,
  getShareText,
  getShareTitle,
  type SharePayload,
} from '@/lib/share'
import { renderShareImage } from '@/lib/share-image'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ShareButtonProps = {
  payload: SharePayload
  disabled?: boolean
}

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError'

export function ShareButton({ payload, disabled }: ShareButtonProps) {
  const shareLink = async () => {
    const url = buildShareUrl(payload)
    try {
      if (navigator.share) {
        await navigator.share({
          title: getShareTitle(payload),
          text: getShareText(payload),
          url,
        })
        return
      }
      await navigator.clipboard.writeText(`${getShareText(payload)}\n${url}`)
      toast.success('결과 링크를 복사했어요.')
    } catch (error) {
      if (!isAbortError(error)) toast.error('링크를 공유하지 못했어요.')
    }
  }

  const shareImage = async () => {
    try {
      const blob = await renderShareImage(payload)
      const file = new File([blob], 'lotto-result.png', { type: 'image/png' })

      // 모바일에서는 공유 시트로 바로 보내고, 그 외에는 파일로 저장
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: getShareTitle(payload) })
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      if (!isAbortError(error)) toast.error('이미지를 만들지 못했어요.')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' disabled={disabled}>
          <Share2 className='size-4' />
          공유
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onSelect={shareLink}>
          <Link2 className='size-4' />
          링크 공유
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={shareImage}>
          <ImageDown className='size-4' />
          이미지로 저장
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
