import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BacktestResult } from '@/lib/backtest'
import { buildHistogram, getPercentile } from '@/lib/backtest-insights'
import {
  getMatchCountProbabilities,
  RANK_PROBABILITIES,
} from '@/lib/lotto-odds'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  chartTooltipStyle,
  formatCompactWon,
  formatExpectedCount,
  formatSignedPercent,
  formatSignedWon,
  formatTopPercent,
  LOSS_COLOR,
  PROFIT_COLOR,
} from '../format'
import { RANDOM_PLAYER_COUNT } from '../use-luck-simulation'
import { ReportSection } from './report-section'

const PRIZE_RANKS = [1, 2, 3, 4, 5] as const
const MATCH_PROBABILITIES = getMatchCountProbabilities()

type LuckSectionProps = {
  result: BacktestResult
  randomNetProfits: Float64Array | null
  isSimulationFailed: boolean
}

export function LuckSection({
  result,
  randomNetProfits,
  isSimulationFailed,
}: LuckSectionProps) {
  return (
    <ReportSection
      step={2}
      title='운 분석'
      description='확률상 기대치, 그리고 같은 조건의 무작위 플레이어와 비교'
    >
      <div className='grid gap-4 lg:grid-cols-2'>
        <RankExpectationCard result={result} />
        <MatchDistributionCard result={result} />
      </div>
      <RandomPlayersCard
        result={result}
        netProfits={randomNetProfits}
        isFailed={isSimulationFailed}
      />
    </ReportSection>
  )
}

function RankExpectationCard({ result }: { result: BacktestResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>등수별 실제 vs 기대</CardTitle>
        <CardDescription>
          {result.gameCount.toLocaleString()}게임 기준 확률상 기대 당첨 횟수
        </CardDescription>
      </CardHeader>
      <CardContent>
        <table className='w-full text-sm'>
          <thead className='text-muted-foreground text-xs'>
            <tr className='border-b'>
              <th className='py-2 text-left font-medium'>등수</th>
              <th className='py-2 text-right font-medium'>확률</th>
              <th className='py-2 text-right font-medium'>기대</th>
              <th className='py-2 text-right font-medium'>실제</th>
            </tr>
          </thead>
          <tbody>
            {PRIZE_RANKS.map((rank) => {
              const expected = result.gameCount * RANK_PROBABILITIES[rank]
              const actual = result.rankCounts[rank]
              const diff = actual - expected
              return (
                <tr key={rank} className='border-b last:border-0'>
                  <td className='py-2 font-medium'>{rank}등</td>
                  <td className='text-muted-foreground py-2 text-right tabular-nums'>
                    1/
                    {Math.round(1 / RANK_PROBABILITIES[rank]).toLocaleString()}
                  </td>
                  <td className='py-2 text-right tabular-nums'>
                    {formatExpectedCount(expected)}
                  </td>
                  <td
                    className={cn(
                      'py-2 text-right font-semibold tabular-nums',
                      Math.abs(diff) >= 0.5 &&
                        (diff > 0 ? 'text-emerald-500' : 'text-destructive')
                    )}
                  >
                    {actual.toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function MatchDistributionCard({ result }: { result: BacktestResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>맞힌 개수 분포</CardTitle>
        <CardDescription>
          당첨번호 6개 중 몇 개를 맞혔는지 (보너스 제외)
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2.5'>
        {result.matchCounts.map((actual, matchCount) => {
          const expected = result.gameCount * MATCH_PROBABILITIES[matchCount]
          const max = Math.max(actual, expected, 1e-9)
          return (
            <div key={matchCount} className='grid grid-cols-[3rem_1fr] gap-2'>
              <span className='text-sm font-medium'>{matchCount}개</span>
              <div className='space-y-1'>
                <Bar2
                  ratio={actual / max}
                  className='bg-primary'
                  label={actual.toLocaleString()}
                />
                <Bar2
                  ratio={expected / max}
                  className='bg-muted-foreground/30'
                  label={`기대 ${formatExpectedCount(expected)}`}
                  muted
                />
              </div>
            </div>
          )
        })}
        <p className='text-muted-foreground pt-1 text-xs'>
          막대는 개수별로 실제와 기대 중 큰 값을 기준으로 그렸어요.
        </p>
      </CardContent>
    </Card>
  )
}

function Bar2({
  ratio,
  className,
  label,
  muted,
}: {
  ratio: number
  className: string
  label: string
  muted?: boolean
}) {
  return (
    <div className='flex items-center gap-2'>
      <div className='bg-muted/50 h-2.5 flex-1 overflow-hidden rounded-full'>
        <div
          className={cn('h-full rounded-full', className)}
          style={{ width: `${Math.max(ratio * 100, ratio > 0 ? 2 : 0)}%` }}
        />
      </div>
      <span
        className={cn(
          'w-24 shrink-0 text-right text-xs tabular-nums',
          muted && 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </div>
  )
}

function RandomPlayersCard({
  result,
  netProfits,
  isFailed,
}: {
  result: BacktestResult
  netProfits: Float64Array | null
  isFailed: boolean
}) {
  const analysis = useMemo(() => {
    if (!netProfits) return null
    // 1·2등 같은 극단적 당첨이 축을 늘리지 않도록 하위 0.5% ~ 상위 1%는 생략
    const { bins, above } = buildHistogram(netProfits, 24, {
      lowerQ: 0.005,
      upperQ: 0.99,
    })
    const userBin = bins.findIndex(
      (bin, i) =>
        result.netProfit >= bin.from &&
        (result.netProfit < bin.to || i === bins.length - 1) &&
        result.netProfit <= bins[bins.length - 1].to
    )
    const sorted = Float64Array.from(netProfits).sort()
    const median = sorted[Math.floor((sorted.length - 1) / 2)]
    let profitable = 0
    for (const value of netProfits) {
      if (value >= 0) profitable += 1
    }
    return {
      histogram: bins.map((bin, i) => ({
        ...bin,
        label: formatCompactWon((bin.from + bin.to) / 2),
        isUser: i === userBin,
      })),
      percentile: getPercentile(netProfits, result.netProfit),
      medianRate: (median / result.spent) * 100,
      profitable,
      omittedAbove: above,
      isOutOfRange: userBin === -1,
    }
  }, [netProfits, result.netProfit, result.spent])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          무작위 {RANDOM_PLAYER_COUNT.toLocaleString()}명과 비교
        </CardTitle>
        <CardDescription>
          같은 기간, 같은 게임 수를 매주 자동으로 산 가상의 플레이어들
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isFailed ? (
          <p className='text-muted-foreground text-sm'>
            비교 시뮬레이션을 실행하지 못했어요.
          </p>
        ) : !analysis ? (
          <div className='space-y-3'>
            <p className='text-muted-foreground text-sm'>
              {(result.gameCount * RANDOM_PLAYER_COUNT).toLocaleString()}게임을
              계산하는 중…
            </p>
            <Skeleton className='h-[220px] w-full' />
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='grid grid-cols-3 gap-3 text-sm'>
              <div>
                <p className='text-muted-foreground text-xs'>내 순위</p>
                <p className='text-lg font-semibold'>
                  {formatTopPercent(analysis.percentile)}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground text-xs'>
                  무작위 중간값 수익률
                </p>
                <p className='text-lg font-semibold tabular-nums'>
                  {formatSignedPercent(analysis.medianRate)}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground text-xs'>본전 이상</p>
                <p className='text-lg font-semibold tabular-nums'>
                  {analysis.profitable.toLocaleString()}명
                </p>
              </div>
            </div>
            <ResponsiveContainer width='100%' height={220}>
              <BarChart
                data={analysis.histogram}
                margin={{ left: 0, right: 8 }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  className='stroke-muted'
                  vertical={false}
                />
                <XAxis
                  dataKey='label'
                  tick={{ fontSize: 11 }}
                  interval='preserveStartEnd'
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                  contentStyle={chartTooltipStyle}
                  formatter={(value: number) => [`${value}명`, '플레이어']}
                  labelFormatter={(_, payload) => {
                    const bin = payload?.[0]?.payload
                    return bin
                      ? `${formatSignedWon(bin.from)} ~ ${formatSignedWon(bin.to)}${bin.isUser ? ' (내 결과)' : ''}`
                      : ''
                  }}
                />
                <Bar
                  dataKey='count'
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                >
                  {analysis.histogram.map((bin) => (
                    <Cell
                      key={bin.from}
                      fill={
                        bin.isUser
                          ? result.netProfit >= 0
                            ? PROFIT_COLOR
                            : LOSS_COLOR
                          : 'var(--chart-1)'
                      }
                      fillOpacity={bin.isUser ? 1 : 0.45}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className='text-muted-foreground text-xs'>
              {analysis.isOutOfRange
                ? `내 결과(${formatSignedWon(result.netProfit)})는 그래프 범위를 벗어났어요.`
                : `진하게 표시된 막대가 내 결과(${formatSignedWon(result.netProfit)})가 속한 구간이에요.`}
              {analysis.omittedAbove > 0 &&
                ` 큰 금액에 당첨된 상위 ${analysis.omittedAbove}명은 그래프 오른쪽 범위 밖이라 생략했어요.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
