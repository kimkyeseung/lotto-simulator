import { useState } from 'react'
import { useResultStore } from '@/stores/result'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'

type ResetResultsButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  'onClick'
>

export function ResetResultsButton(props: ResetResultsButtonProps) {
  const [open, setOpen] = useState(false)
  const initialize = useResultStore((state) => state.initialize)

  return (
    <>
      <Button {...props} onClick={() => setOpen(true)} />
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title='시뮬레이션 결과 초기화'
        desc='누적된 구매 금액, 당첨 통계, 진행 기록이 모두 삭제됩니다. 계속하시겠습니까?'
        confirmText='초기화'
        destructive
        handleConfirm={() => {
          initialize()
          setOpen(false)
        }}
      />
    </>
  )
}
