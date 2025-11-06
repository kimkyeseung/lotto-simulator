import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  BarChart,
  Bar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useResultStore } from '@/stores/result'

const currencyFormatter = (value: number) =>
  `${value >= 0 ? '' : '-'}${Math.abs(value).toLocaleString()}`

const percentFormatter = (value: number) => `${value.toFixed(2)}%`

function useHistoryData() {
  const history = useResultStore((state) => state.history)

  return useMemo(() => {
    if (!history.length) return []

    return history.map((entry) => ({
      id: entry.id,
      label: `${entry.submittedCount}회`,
      submittedCount: entry.submittedCount,
      netProfit: entry.netProfit,
      totalPrize: entry.totalPrize,
      usedMoney: entry.usedMoney,
      profitRate: entry.profitRate,
      timestamp: entry.timestamp,
    }))
  }, [history])
}

function RealtimeProgress() {
  const historyData = useHistoryData()

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>실시간 진행률</CardTitle>
      </CardHeader>
      <CardContent className='h-[280px]'>
        {historyData.length ? (
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='label' />
              <YAxis
                yAxisId='left'
                tickFormatter={(value) => `${currencyFormatter(value / 1000)}k`}
              />
              <YAxis
                yAxisId='right'
                orientation='right'
                tickFormatter={(value) => percentFormatter(value)}
              />
              <Tooltip
                formatter={(value, _name, item) => {
                  if (item?.dataKey === 'profitRate') {
                    return [`${(value as number).toFixed(2)}%`, '수익률']
                  }
                  return [
                    `${currencyFormatter(value as number)} 원`,
                    '순이익',
                  ]
                }}
              />
              <Line
                type='monotone'
                yAxisId='left'
                dataKey='netProfit'
                name='순이익'
                stroke='hsl(var(--primary))'
                strokeWidth={2}
                dot={false}
              />
              <Line
                type='monotone'
                yAxisId='right'
                dataKey='profitRate'
                name='수익률'
                stroke='#16a34a'
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className='text-muted-foreground text-sm'>
            아직 데이터가 없습니다. 시뮬레이션을 시작해보세요.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function RevenueSummary() {
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
          <p className='text-sm text-muted-foreground'>순이익</p>
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
          <p className='text-sm text-muted-foreground'>수익률</p>
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

function RankDistributionChart() {
  const winningRankCounts = useResultStore((state) => state.winningRankCounts)

  const data = useMemo(() => {
    const ranks = [1, 2, 3, 4, 5, 0] as const
    return ranks
      .map((rank) => ({
        rank,
        label: rank === 0 ? '낙첨' : `${rank}등`,
        count: winningRankCounts[rank] ?? 0,
      }))
      .filter((item) => item.count > 0)
  }, [winningRankCounts])

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>등수별 분포</CardTitle>
      </CardHeader>
      <CardContent className='h-[260px]'>
        {data.length ? (
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='label' />
              <YAxis tickFormatter={(value) => `${value}`} />
              <Tooltip
                formatter={(value) => `${(value as number).toLocaleString()} 회`}
              />
              <Bar
                dataKey='count'
                fill='hsl(var(--primary))'
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className='text-muted-foreground text-sm'>
            아직 당첨 데이터가 없습니다.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function NumberFrequencyHeatmap() {
  const numberStatsMap = useResultStore((state) => state.numberStatsMap)

  const { maxCount, stats } = useMemo(() => {
    let max = 0
    const numbers = Array.from({ length: 45 }, (_, index) => {
      const number = index + 1
      const statsForNumber = numberStatsMap[number]
      const count = statsForNumber?.submittedCount ?? 0
      if (count > max) {
        max = count
      }
      return {
        number,
        submittedCount: count,
        hitCount: statsForNumber?.hitCount ?? 0,
        resultCount: statsForNumber?.resultCount ?? 0,
      }
    })

    return { maxCount: max, stats: numbers }
  }, [numberStatsMap])

  const getIntensityClass = (count: number) => {
    if (maxCount === 0) return 'bg-muted'
    const ratio = count / maxCount
    if (ratio > 0.75) return 'bg-emerald-500 text-white'
    if (ratio > 0.5) return 'bg-emerald-400 text-white'
    if (ratio > 0.25) return 'bg-emerald-300 text-emerald-900'
    if (ratio > 0) return 'bg-emerald-200 text-emerald-900'
    return 'bg-muted text-muted-foreground'
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>번호 빈도 히트맵</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='grid grid-cols-9 gap-2 text-xs'>
          {stats.map((item) => (
            <div
              key={item.number}
              className={`flex aspect-square flex-col items-center justify-center rounded-md p-1 ${getIntensityClass(item.submittedCount)}`}
            >
              <span className='font-semibold'>{item.number}</span>
              <span>{item.submittedCount}</span>
            </div>
          ))}
        </div>
        <p className='text-muted-foreground text-xs'>
          숫자별 구매 빈도를 색상 농도로 나타냅니다. 진할수록 자주 선택된
          숫자입니다.
        </p>
      </CardContent>
    </Card>
  )
}

export function DashboardAnalytics() {
  return (
    <div className='space-y-4'>
      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <RealtimeProgress />
        </div>
        <RevenueSummary />
      </div>
      <div className='grid gap-4 lg:grid-cols-2'>
        <RankDistributionChart />
        <NumberFrequencyHeatmap />
      </div>
    </div>
  )
}
