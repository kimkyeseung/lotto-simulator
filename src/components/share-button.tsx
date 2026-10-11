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

function downloadFile(file: File) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  // 클릭 직후 바로 해제하면 일부 브라우저에서 다운로드가 취소됨
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

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
    let file: File
    try {
      const blob = await renderShareImage(payload)
      file = new File([blob], 'lotto-result.png', { type: 'image/png' })
    } catch {
      toast.error('이미지를 만들지 못했어요.')
      return
    }

    // 모바일에서는 공유 시트로 바로 보내고, 그 외에는 파일로 저장
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: getShareTitle(payload) })
        return
      } catch (error) {
        if (isAbortError(error)) return
        // 이미지 생성이 길어져 사용자 동작이 만료된 경우 등은 다운로드로 대체
      }
    }
    downloadFile(file)
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
