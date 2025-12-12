import { useMemo } from 'react'
import { useResultStore } from '@/stores/result'
import { NumberBall } from '@/components/ui/number-ball'

export function LuckyNumbers() {
  const numberStatsMap = useResultStore((state) => state.numberStatsMap)

  const { luckyNumbers, unluckyNumbers } = useMemo(() => {
    // 적중률 계산
    const numbersWithRate = Object.entries(numberStatsMap)
      .map(([number, stats]) => {
        const hitRate =
          stats.submittedCount > 0
            ? (stats.hitCount / stats.submittedCount) * 100
            : 0
        return {
          number: Number(number),
          hitRate,
          hitCount: stats.hitCount,
          submittedCount: stats.submittedCount,
        }
      })
      .filter((item) => item.submittedCount > 0) // 제출된 적이 있는 숫자만

    // 적중률 순으로 정렬
    const sorted = [...numbersWithRate].sort((a, b) => b.hitRate - a.hitRate)

    return {
      luckyNumbers: sorted.slice(0, 6),
      unluckyNumbers: sorted.slice(-6).reverse(),
    }
  }, [numberStatsMap])

  const hasData = luckyNumbers.length > 0

  if (!hasData) {
    return (
      <div className='space-y-6 text-center text-sm text-muted-foreground'>
        <p>시뮬레이션 데이터가 충분하지 않습니다.</p>
        <p>티켓을 구매하면 행운의 숫자를 확인할 수 있습니다.</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* 행운의 숫자 */}
      <div className='space-y-3'>
        <div>
          <h3 className='text-sm font-semibold text-foreground'>
            🍀 행운의 숫자
          </h3>
          <p className='text-xs text-muted-foreground'>
            적중률이 높은 숫자들
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          {luckyNumbers.map((item) => (
            <div key={item.number} className='flex flex-col items-center gap-1'>
              <NumberBall>{item.number}</NumberBall>
              <span className='text-xs text-muted-foreground'>
                {item.hitRate.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 불운의 숫자 */}
      <div className='space-y-3'>
        <div>
          <h3 className='text-sm font-semibold text-foreground'>
            😔 피해야 할 숫자
          </h3>
          <p className='text-xs text-muted-foreground'>
            적중률이 낮은 숫자들
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          {unluckyNumbers.map((item) => (
            <div key={item.number} className='flex flex-col items-center gap-1'>
              <NumberBall>{item.number}</NumberBall>
              <span className='text-xs text-muted-foreground'>
                {item.hitRate.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
