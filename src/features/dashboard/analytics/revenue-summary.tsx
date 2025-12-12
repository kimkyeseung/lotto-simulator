import { useResultStore } from '@/stores/result'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { currencyFormatter } from './utils'

export function RevenueSummary() {
  const usedMoney = useResultStore((state) => state.usedMoney)
  const totalPrize = useResultStore((state) => state.totalPrize)
  const submittedCount = useResultStore((state) => state.submittedCount)
  const history = useResultStore((state) => state.history)

  const previousSnapshot =
    history.length > 1 ? history[history.length - 2] : undefined

  const netProfit = totalPrize - usedMoney
  const profitRate =
    usedMoney === 0 ? 0 : ((totalPrize - usedMoney) / usedMoney) * 100
  const averageSpend = submittedCount === 0 ? 0 : usedMoney / submittedCount
  const averagePrize = submittedCount === 0 ? 0 : totalPrize / submittedCount

  const netProfitDelta =
    previousSnapshot != null ? netProfit - previousSnapshot.netProfit : null
  const profitRateDelta =
    previousSnapshot != null ? profitRate - previousSnapshot.profitRate : null

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>수입 요약</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <p className='text-muted-foreground text-sm'>순이익</p>
          <p
            className={`text-2xl font-semibold ${
              netProfit >= 0 ? 'text-emerald-500' : 'text-destructive'
            }`}
          >
            {netProfit >= 0 ? '+' : ''}
            {currencyFormatter(netProfit)} 원
          </p>
          {netProfitDelta != null && (
            <p className='text-muted-foreground text-xs'>
              {netProfitDelta >= 0 ? '▲' : '▼'}{' '}
              {currencyFormatter(Math.abs(netProfitDelta))} 원 (이전 대비)
            </p>
          )}
        </div>

        <div>
          <p className='text-muted-foreground text-sm'>수익률</p>
          <p
            className={`text-xl font-semibold ${
              profitRate >= 0 ? 'text-emerald-500' : 'text-destructive'
            }`}
          >
            {profitRate >= 0 ? '+' : ''}
            {profitRate.toFixed(2)}%
          </p>
          {profitRateDelta != null && (
            <p className='text-muted-foreground text-xs'>
              {profitRateDelta >= 0 ? '▲' : '▼'}{' '}
              {Math.abs(profitRateDelta).toFixed(2)}% (이전 대비)
            </p>
          )}
        </div>

        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div className='rounded-lg border p-3'>
            <p className='text-muted-foreground text-xs'>평균 구매 금액</p>
            <p className='mt-1 font-semibold'>
              {currencyFormatter(Math.round(averageSpend))} 원
            </p>
          </div>
          <div className='rounded-lg border p-3'>
            <p className='text-muted-foreground text-xs'>평균 상금</p>
            <p className='mt-1 font-semibold'>
              {currencyFormatter(Math.round(averagePrize))} 원
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
