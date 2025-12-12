import { useResultStore } from '@/stores/result'
import { useShallow } from 'zustand/shallow'
import { cn } from '@/lib/utils'
import type { WinningRank } from '@/types/lotto'

function WinningRankBadge({ rank }: { rank: WinningRank }) {
  if (rank === 0) {
    return <span className='text-muted-foreground text-xs'>-</span>
  }

  const rankColors = {
    1: 'bg-yellow-500 text-white',
    2: 'bg-orange-500 text-white',
    3: 'bg-red-500 text-white',
    4: 'bg-blue-500 text-white',
    5: 'bg-gray-500 text-white',
  } as const

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded',
        rankColors[rank as keyof typeof rankColors]
      )}
    >
      {rank}
    </span>
  )
}

export function HistoryLog() {
  const history = useResultStore(
    useShallow((state) => state.history)
  )

  if (history.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground text-sm'>
          아직 시뮬레이션 히스토리가 없습니다.
        </p>
        <p className='text-muted-foreground text-xs mt-2'>
          로또를 구매하면 각 회차별 결과가 여기에 기록됩니다.
        </p>
      </div>
    )
  }

  // 최신순으로 정렬
  const sortedHistory = [...history].reverse()

  return (
    <div className='space-y-2'>
      <div className='grid grid-cols-7 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b'>
        <div>회차</div>
        <div className='text-right'>사용 금액</div>
        <div className='text-right'>당첨 금액</div>
        <div className='text-right'>순이익</div>
        <div className='text-right'>수익률</div>
        <div>당첨 결과</div>
        <div className='text-right'>시간</div>
      </div>
      <div className='max-h-[600px] overflow-y-auto space-y-1'>
        {sortedHistory.map((entry) => {
          const isProfit = entry.netProfit >= 0
          const profitColor = isProfit ? 'text-emerald-500' : 'text-destructive'

          return (
            <div
              key={entry.id}
              className='grid grid-cols-7 gap-2 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors'
            >
              <div className='font-medium'>
                #{entry.submittedCount}
              </div>
              <div className='text-right tabular-nums'>
                {entry.usedMoney.toLocaleString()}원
              </div>
              <div className='text-right tabular-nums'>
                {entry.totalPrize.toLocaleString()}원
              </div>
              <div className={cn('text-right tabular-nums font-medium', profitColor)}>
                {isProfit ? '+' : ''}{entry.netProfit.toLocaleString()}원
              </div>
              <div className={cn('text-right tabular-nums font-medium', profitColor)}>
                {isProfit ? '+' : ''}{entry.profitRate.toFixed(2)}%
              </div>
              <div className='flex gap-1 items-center'>
                {entry.winningRanks?.map((rank, idx) => (
                  <WinningRankBadge key={idx} rank={rank} />
                )) || '-'}
              </div>
              <div className='text-right text-xs text-muted-foreground'>
                {new Date(entry.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className='pt-2 border-t text-xs text-muted-foreground text-center'>
        총 {history.length}개의 기록
      </div>
    </div>
  )
}
