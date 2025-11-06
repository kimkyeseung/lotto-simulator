import { useResultStore } from '@/stores/result'

export function Statistics() {
  const { usedMoney, totalPrize, submittedCount, winningRankCounts } =
    useResultStore()
  const prizeRanks = [1, 2, 3, 4, 5] as const
  return (
    <div className='space-y-4'>
      <div className='flex flex-1 flex-wrap items-center justify-between'>
        <p className='text-sm leading-none font-medium'>회차</p>
        <div className='font-medium'>{submittedCount} 회</div>
      </div>
      <div className='flex flex-1 flex-wrap items-center justify-between'>
        <p className='text-sm leading-none font-medium'>누적 사용금액</p>
        <div className='font-medium'>{usedMoney.toLocaleString()} 원</div>
      </div>
      <div className='flex flex-1 flex-wrap items-center justify-between'>
        <p className='text-sm leading-none font-medium'>누적 상금</p>
        <div className='font-medium'>{totalPrize.toLocaleString()} 원</div>
      </div>
      <div className='space-y-2'>
        <p className='text-sm leading-none font-medium'>등수별 당첨 횟수</p>
        <div className='space-y-1.5'>
          {prizeRanks.map((rank) => (
            <div
              key={rank}
              className='flex flex-1 flex-wrap items-center justify-between text-sm'
            >
              <span>{rank}등</span>
              <span className='font-medium'>
                {(winningRankCounts?.[rank] ?? 0).toLocaleString()} 회
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
