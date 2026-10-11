import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BacktestResult } from '@/lib/backtest'
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
  formatSignedWon,
  formatWon,
  LOSS_COLOR,
  PROFIT_COLOR,
} from '../format'
import { ReportSection, StatTile } from './report-section'

export function TimelineSection({ result }: { result: BacktestResult }) {
  const { firstWin, longestDrought } = result
  const years = result.years.map((year) => ({
    ...year,
    net: year.prize - year.spent,
  }))
  const bestYear = years.reduce<(typeof years)[number] | null>(
    (best, year) => (!best || year.net > best.net ? year : best),
    null
  )

  return (
    <ReportSection
      step={3}
      title='시간 흐름'
      description='언제 잃고 언제 땄는지, 회차와 연도별로'
    >
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <StatTile
          label='첫 당첨'
          value={
            firstWin ? `${firstWin.drawsUntil.toLocaleString()}주 만에` : '없음'
          }
          hint={
            firstWin
              ? `${firstWin.drawNo}회(${firstWin.date}) ${firstWin.rank}등`
              : '이 기간에는 당첨이 없었어요'
          }
        />
        <StatTile
          label='최장 연속 꽝'
          value={
            longestDrought
              ? `${longestDrought.length.toLocaleString()}주`
              : '0주'
          }
          hint={
            longestDrought
              ? `${longestDrought.fromNo}회 ~ ${longestDrought.toNo}회 (약 ${(longestDrought.length / 52).toFixed(1)}년)`
              : '매 회차 하나 이상 당첨'
          }
        />
        <StatTile
          label='누적 최고점'
          value={
            result.peakNetProfit > 0
              ? formatSignedWon(result.peakNetProfit)
              : '본전 못 넘음'
          }
          hint={
            result.peakNetProfit > 0
              ? '한때 본전보다 앞섰어요'
              : '첫 회차 이후 한 번도 본전을 넘지 못했어요'
          }
          valueClassName={
            result.peakNetProfit > 0 ? 'text-emerald-500' : undefined
          }
        />
        <StatTile
          label='최대 낙폭'
          value={formatWon(result.maxDrawdown)}
          hint='누적 최고점에서 가장 크게 떨어진 금액'
          valueClassName='text-destructive'
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>누적 손익</CardTitle>
            <CardDescription>
              회차가 지날수록 손익이 어떻게 변했는지
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={240}>
              <AreaChart data={result.timeline} margin={{ left: 0, right: 8 }}>
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
                <ReferenceLine
                  y={0}
                  stroke='var(--muted-foreground)'
                  strokeDasharray='4 4'
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value: number) => [
                    formatSignedWon(value),
                    '누적 손익',
                  ]}
                  labelFormatter={(no, payload) =>
                    `${no}회 (${payload?.[0]?.payload?.date ?? ''})`
                  }
                />
                <Area
                  type='monotone'
                  dataKey='netProfit'
                  stroke='var(--chart-1)'
                  fill='var(--chart-1)'
                  fillOpacity={0.15}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>연도별 손익</CardTitle>
            <CardDescription>
              {bestYear && bestYear.net > 0
                ? `가장 좋았던 해: ${bestYear.year}년 (${formatSignedWon(bestYear.net)})`
                : '모든 해가 손실이었어요'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={240}>
              <BarChart data={years} margin={{ left: 0, right: 8 }}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  className='stroke-muted'
                  vertical={false}
                />
                <XAxis
                  dataKey='year'
                  tickFormatter={(year) => `'${String(year).slice(2)}`}
                  tick={{ fontSize: 11 }}
                  minTickGap={8}
                />
                <YAxis
                  tickFormatter={formatCompactWon}
                  tick={{ fontSize: 11 }}
                  width={56}
                />
                <ReferenceLine y={0} stroke='var(--muted-foreground)' />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                  contentStyle={chartTooltipStyle}
                  labelFormatter={(year) => `${year}년`}
                  formatter={(value: number, _name, item) => [
                    `${formatSignedWon(value)} (구매 ${formatWon(item.payload.spent)} · 당첨 ${formatWon(item.payload.prize)})`,
                    '손익',
                  ]}
                />
                <Bar
                  dataKey='net'
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                >
                  {years.map((year) => (
                    <Cell
                      key={year.year}
                      fill={year.net >= 0 ? PROFIT_COLOR : LOSS_COLOR}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </ReportSection>
  )
}
