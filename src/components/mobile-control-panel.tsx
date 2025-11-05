import { Play, Pause, RotateCcw } from 'lucide-react'
import { useConfigStore } from '@/stores/config'
import { useResultStore } from '@/stores/result'
import { cn } from '@/lib/utils'
import { useLotto } from '@/hooks/use-lotto'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

export function MobileControlPanel() {
  const {
    onSubmit: onSingleDraw,
    isSubmitDisabled,
    cost,
    validForms,
  } = useLotto()
  const { isAutoRunning, toggleAutoRun } = useConfigStore()
  const { submittedCount } = useResultStore()
  const initialize = useResultStore((state) => state.initialize)
  const canRun = true

  return (
    <div className='bg-background/95 pb-safe fixed right-0 bottom-0 left-0 z-50 border-t shadow-2xl backdrop-blur-lg'>
      <div className='container mx-auto space-y-3 p-4'>
        {/* Status Bar */}
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground'>활성 티켓</span>
            <Badge variant='secondary'>{validForms.length}개</Badge>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground'>회차 비용</span>
            <span className='text-primary'>{cost.toLocaleString()}원</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground'>회차</span>
            <Badge variant='outline'>{submittedCount}회</Badge>
          </div>
        </div>

        {/* Auto Run Indicator */}
        {isAutoRunning && (
          <div className='bg-primary/10 border-primary/20 flex items-center gap-2 rounded-lg border p-2'>
            <div className='flex flex-1 items-center gap-2'>
              <div className='bg-primary h-2 w-2 animate-pulse rounded-full' />
              <span className='text-sm'>자동 구매 진행 중...</span>
            </div>
            <Badge variant='default' className='animate-pulse'>
              실행 중
            </Badge>
          </div>
        )}

        {/* Control Buttons */}
        <div className='grid grid-cols-3 gap-2'>
          <Button
            size='lg'
            variant='outline'
            onClick={initialize}
            disabled={submittedCount === 0 || isAutoRunning || isSubmitDisabled}
            className='h-12'
          >
            <RotateCcw className='mr-1 h-4 w-4' />
            초기화
          </Button>

          <Button
            size='lg'
            onClick={onSingleDraw}
            disabled={!canRun || isAutoRunning || isSubmitDisabled}
            className='h-12'
          >
            <Play className='mr-1 h-4 w-4' />
            1회
          </Button>

          <Button
            size='lg'
            variant={isAutoRunning ? 'destructive' : 'default'}
            onClick={toggleAutoRun}
            disabled={!canRun || isSubmitDisabled}
            className={cn('h-12', isAutoRunning && 'animate-pulse')}
          >
            {isAutoRunning ? (
              <>
                <Pause className='mr-1 h-4 w-4' />
                중지
              </>
            ) : (
              <>
                <Play className='mr-1 h-4 w-4' />
                자동
              </>
            )}
          </Button>
        </div>

        {/* Warning */}
        {!canRun && (
          <div className='rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2'>
            <p className='text-center text-xs text-yellow-600 dark:text-yellow-400'>
              최소 1개 이상의 티켓을 활성화해주세요
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
