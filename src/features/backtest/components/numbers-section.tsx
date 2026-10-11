import { useMemo } from 'react'
import {
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
import type { BacktestResult, Draw } from '@/lib/backtest'
import { countNumberAppearances } from '@/lib/backtest-insights'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { NumberBall } from '@/components/ui/number-ball'
import { chartTooltipStyle, formatWon } from '../format'
import { ReportSection } from './report-section'

type NumbersSectionProps = {
  result: BacktestResult
  draws: Draw[]
  tickets: number[][]
  ticketNames: string[]
}

export function NumbersSection({
  result,
  draws,
  tickets,
  ticketNames,
}: NumbersSectionProps) {
  const stats = useMemo(() => {
    const { main, bonus } = countNumberAppearances(draws)
    const expected = (draws.length * 6) / 45
    const numbers = Array.from({ length: 45 }, (_, i) => i + 1)
    const ranked = [...numbers].sort((a, b) => main[b] - main[a] || a - b)
    const rankOf = new Map(ranked.map((n, i) => [n, i + 1]))
    const picked = [...new Set(tickets.flat())].sort((a, b) => a - b)
    return {
      main,
      bonus,
      expected,
      rankOf,
      picked,
      pickedSet: new Set(picked),
      most: ranked.slice(0, 3),
      least: ranked.slice(-3).reverse(),
      chart: numbers.map((n) => ({ number: n, count: main[n] })),
    }
  }, [draws, tickets])

  return (
    <ReportSection
      step={4}
      title='번호 분석'
      description='내가 고른 번호가 실제로 얼마나 나왔는지, 아깝게 놓친 순간'
    >
      <div className='grid gap-4 lg:grid-cols-12'>
        <Card className='lg:col-span-5'>
          <CardHeader>
            <CardTitle>내 번호 성적표</CardTitle>
            <CardDescription>
              {draws.length.toLocaleString()}회 동안 번호 하나당 평균{' '}
              {stats.expected.toFixed(1)}번 당첨번호로 나왔어요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.picked.length === 0 ? (
              <p className='text-muted-foreground text-sm'>
                직접 고른 번호가 없어요. Overview에서 번호를 고르면 번호별
                성적을 보여드려요.
              </p>
            ) : (
              <div className='space-y-2'>
                {stats.picked.map((number) => {
                  const count = stats.main[number]
                  const diff = (count / stats.expected - 1) * 100
                  return (
                    <div
                      key={number}
                      className='grid grid-cols-[2rem_1fr_auto] items-center gap-3 text-sm'
                    >
                      <NumberBall isSmall>{number}</NumberBall>
                      <div className='bg-muted/50 h-2 overflow-hidden rounded-full'>
                        <div
                          className={cn(
                            'h-full rounded-full',
                            diff >= 0 ? 'bg-emerald-500' : 'bg-destructive'
                          )}
                          style={{
                            width: `${Math.min(100, (count / (stats.expected * 1.4)) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className='text-right tabular-nums'>
                        <span className='font-medium'>{count}번</span>{' '}
                        <span
                          className={cn(
                            'text-xs',
                            diff >= 0 ? 'text-emerald-500' : 'text-destructive'
                          )}
                        >
                          ({diff >= 0 ? '+' : ''}
                          {diff.toFixed(0)}%)
                        </span>
                        <p className='text-muted-foreground text-xs'>
                          45개 중 {stats.rankOf.get(number)}위 · 보너스{' '}
                          {stats.bonus[number]}번
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='lg:col-span-7'>
          <CardHeader>
            <CardTitle>1~45 출현 횟수</CardTitle>
            <CardDescription>
              가장 많이:{' '}
              {stats.most.map((n) => `${n}(${stats.main[n]})`).join(', ')} ·
              가장 적게:{' '}
              {stats.least.map((n) => `${n}(${stats.main[n]})`).join(', ')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={240}>
              <BarChart data={stats.chart} margin={{ left: 0, right: 8 }}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  className='stroke-muted'
                  vertical={false}
                />
                <XAxis dataKey='number' tick={{ fontSize: 10 }} interval={4} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  width={36}
                  domain={[
                    (dataMin: number) => Math.max(0, dataMin - 5),
                    'dataMax + 5',
                  ]}
                  allowDecimals={false}
                />
                <ReferenceLine
                  y={stats.expected}
                  stroke='var(--muted-foreground)'
                  strokeDasharray='4 4'
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                  contentStyle={chartTooltipStyle}
                  labelFormatter={(n) =>
                    `${n}번${stats.pickedSet.has(Number(n)) ? ' (내 번호)' : ''}`
                  }
                  formatter={(value: number) => [`${value}번`, '당첨번호 출현']}
                />
                <Bar
                  dataKey='count'
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                >
                  {stats.chart.map((item) => (
                    <Cell
                      key={item.number}
                      fill='var(--chart-1)'
                      fillOpacity={stats.pickedSet.has(item.number) ? 1 : 0.3}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className='text-muted-foreground text-xs'>
              점선은 평균, 진한 막대는 내가 고른 번호예요. 번호마다 나온 횟수는
              달라도 다음 회차에 나올 확률은 모두 같아요.
            </p>
          </CardContent>
        </Card>
      </div>

      <NearMissCard result={result} ticketNames={ticketNames} />
    </ReportSection>
  )
}

function NearMissCard({
  result,
  ticketNames,
}: {
  result: BacktestResult
  ticketNames: string[]
}) {
  const nearMisses = result.nearMisses
  return (
    <Card>
      <CardHeader>
        <CardTitle>아깝게 놓친 순간</CardTitle>
        <CardDescription>
          {nearMisses.length > 0
            ? '5개를 맞혔지만 한 끗 차이로 더 큰 당첨금을 놓친 게임'
            : `5개를 맞힌 적은 없어요. 4개를 맞힌 게임은 ${result.matchCounts[4].toLocaleString()}번이에요.`}
        </CardDescription>
      </CardHeader>
      {nearMisses.length > 0 && (
        <CardContent className='space-y-3'>
          {nearMisses.map((miss) => (
            <div
              key={`${miss.drawNo}-${miss.ticketIndex}`}
              className='flex flex-wrap items-center justify-between gap-3 rounded-md border p-3'
            >
              <div className='space-y-1'>
                <p className='text-sm font-medium'>
                  {miss.drawNo}회 ({miss.date}) ·{' '}
                  {ticketNames[miss.ticketIndex]} 용지 · {miss.rank}등{' '}
                  {formatWon(miss.prize)}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {miss.rank === 2 ? '번호 하나' : '보너스 번호 하나'} 차이로{' '}
                  {miss.rank - 1}등{' '}
                  <span className='text-destructive font-medium'>
                    {formatWon(miss.missedPrize)}
                  </span>
                  을 놓쳤어요
                </p>
              </div>
              <div className='flex flex-wrap gap-1'>
                {miss.ticket.map((number) => (
                  <NumberBall
                    key={number}
                    isSmall
                    isDeactivated={!miss.matchedNumbers.includes(number)}
                  >
                    {number}
                  </NumberBall>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}
