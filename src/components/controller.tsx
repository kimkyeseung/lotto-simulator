import { Play, Pause, RefreshCw } from 'lucide-react'
import { useConfigStore } from '@/stores/config'
import { useLotto } from '@/hooks/use-lotto'
import { Button } from '@/components/ui/button'
import { ResetResultsButton } from '@/components/reset-results-button'

export function Controller() {
  const { onSubmit, isSubmitDisabled } = useLotto()
  const { isAutoRunning, toggleAutoRun } = useConfigStore()

  return (
    <div className='flex items-center space-x-2'>
      <Button
        size={'lg'}
        onClick={onSubmit}
        disabled={isSubmitDisabled || isAutoRunning}
      >
        {isAutoRunning ? '자동 구매 진행 중...' : '1회 구매하기'}
      </Button>
      <ResetResultsButton size={'icon'} aria-label='결과 초기화'>
        <RefreshCw className='size-4' />
      </ResetResultsButton>
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
