import { Play, Pause, RefreshCw } from 'lucide-react'
import { useConfigStore } from '@/stores/config'
import { useResultStore } from '@/stores/result'
import { useLotto } from '@/hooks/use-lotto'
import { Button } from '@/components/ui/button'

export function Controller() {
  const { onSubmit, isSubmitDisabled } = useLotto()
  const { isAutoRunning, toggleAutoRun } = useConfigStore()
  const initialize = useResultStore((state) => state.initialize)

  return (
    <div className='flex items-center space-x-2'>
      <Button
        size={'lg'}
        onClick={onSubmit}
        disabled={isSubmitDisabled || isAutoRunning}
      >
        {isAutoRunning ? '자동 구매 진행 중...' : '구매하기'}
      </Button>
      <Button size={'icon'} onClick={initialize}>
        <RefreshCw className='size-4' />
      </Button>
      <Button size={'icon'} onClick={toggleAutoRun}>
        {isAutoRunning ? (
          <Pause className='size-4' />
        ) : (
          <Play className='size-4' />
        )}
      </Button>
    </div>
  )
}
