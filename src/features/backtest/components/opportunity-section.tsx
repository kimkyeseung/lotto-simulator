import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { type BacktestResult, type Draw, getTicketPrice } from '@/lib/backtest'
import { RANK_PROBABILITIES } from '@/lib/lotto-odds'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  chartTooltipStyle,
  formatCompactWon,
  formatWon,
  PROFIT_COLOR,
} from '../format'
import { ReportSection, StatTile } from './report-section'

const CHICKEN_PRICE = 20_000

type OpportunitySectionProps = {
  result: BacktestResult
  draws: Draw[]
  gamesPerDraw: number
}

export function OpportunitySection({
  result,
  draws,
  gamesPerDraw,
}: OpportunitySectionProps) {
  const [ratePercent, setRatePercent] = useState(3)

  // 타임라인 회차마다 적금 잔액을 구해 로또 누적 당첨금과 비교
  const { series, savings } = useMemo(() => {
    const weeklyRate = ratePercent / 100 / 52
    const sampled = new Map(result.timeline.map((point) => [point.no, point]))
    const points: {
      no: number
      date: string
      spent: number
      prize: number
      savings: number
    }[] = []
    let balance = 0
    for (const draw of draws) {
      balance =
        balance * (1 + weeklyRate) + getTicketPrice(draw.date) * gamesPerDraw
      const point = sampled.get(draw.no)
      if (point) {
        points.push({
          no: point.no,
          date: point.date,
          spent: point.spent,
          prize: point.netProfit + point.spent,
          savings: balance,
        })
      }
    }
    return { series: points, savings: balance }
  }, [draws, gamesPerDraw, ratePercent, result.timeline])

  const interest = savings - result.spent
  const gap = savings - result.prize
  const jackpotChance =
    (1 - Math.pow(1 - RANK_PROBABILITIES[1], result.gameCount)) * 100

  return (
    <ReportSection
      step={6}
      title='기회비용'
      description='같은 돈을 매주 적금에 넣었다면'
    >
      <Card>
        <CardHeader className='flex flex-row flex-wrap items-end justify-between gap-4'>
          <div className='space-y-1.5'>
            <CardTitle>로또 vs 적금</CardTitle>
            <CardDescription>
              매주 로또에 쓴 금액을 연 {ratePercent.toFixed(1)}% 적금에 넣었다고
              가정 (세전, 주 단위 복리)
            </CardDescription>
          </div>
          <label className='flex items-center gap-3 text-sm'>
            <span className='text-muted-foreground'>연이율</span>
            <input
              type='range'
              min={0}
              max={10}
              step={0.5}
              value={ratePercent}
              onChange={(event) => setRatePercent(Number(event.target.value))}
              className='accent-primary w-36'
              aria-label='적금 연이율'
            />
            <span className='w-12 text-right font-medium tabular-nums'>
              {ratePercent.toFixed(1)}%
            </span>
          </label>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
            <StatTile
              label='적금 잔액'
              value={formatWon(savings)}
              hint={`원금 ${formatWon(result.spent)} + 이자 ${formatWon(interest)}`}
              valueClassName='text-emerald-500'
            />
            <StatTile label='로또 당첨금' value={formatWon(result.prize)} />
            <StatTile
              label='적금과의 차이'
              value={formatWon(Math.abs(gap))}
              hint={
                gap >= 0
                  ? '적금이 이만큼 더 남겼어요'
                  : '이번엔 로또가 이만큼 더 벌었어요'
              }
              valueClassName={cn(
                gap >= 0 ? 'text-emerald-500' : 'text-destructive'
              )}
            />
            <StatTile
              label='1등 한 번이라도 될 확률'
              value={`${jackpotChance < 0.01 ? jackpotChance.toFixed(4) : jackpotChance.toFixed(2)}%`}
              hint={`${result.gameCount.toLocaleString()}게임 기준`}
            />
          </div>

          <ResponsiveContainer width='100%' height={260}>
            <LineChart data={series} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
              <XAxis
                dataKey='no'
                tickFormatter={(no) => `${no}회`}
                tick={{ fontSize: 11 }}
                minTickGap={40}
              />
              <YAxis
                tickFormatter={formatCompactWon}
                tick={{ fontSize: 11 }}
                width={56}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelFormatter={(no, payload) =>
                  `${no}회 (${payload?.[0]?.payload?.date ?? ''})`
                }
                formatter={(value, name) => [formatWon(Number(value)), name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type='monotone'
                dataKey='savings'
                name='적금 잔액'
                stroke={PROFIT_COLOR}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type='monotone'
                dataKey='spent'
                name='누적 구매액'
                stroke='var(--muted-foreground)'
                strokeDasharray='4 4'
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type='monotone'
                dataKey='prize'
                name='로또 누적 당첨금'
                stroke='var(--chart-1)'
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <p className='text-muted-foreground text-sm'>
            로또에 쓴 {formatWon(result.spent)}이면 치킨{' '}
            <span className='text-foreground font-medium'>
              {Math.floor(result.spent / CHICKEN_PRICE).toLocaleString()}마리
            </span>
            (마리당 {formatWon(CHICKEN_PRICE)})를 먹을 수 있었어요.
          </p>
        </CardContent>
      </Card>
    </ReportSection>
  )
}
