import type { BacktestResult } from '@/lib/backtest'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { NumberBall } from '@/components/ui/number-ball'
import {
  formatSignedPercent,
  formatSignedWon,
  formatTopPercent,
  formatWon,
  getLuckVerdict,
  profitClass,
} from '../format'
import { ReportSection, StatTile } from './report-section'

type SummarySectionProps = {
  result: BacktestResult
  /** 무작위 플레이어 대비 백분위. 계산 중이면 null */
  percentile: number | null
}

export function SummarySection({ result, percentile }: SummarySectionProps) {
  const returnPer1000 =
    result.spent === 0 ? 0 : (result.prize / result.spent) * 1000
  const expectedRatio =
    result.expectedPrize === 0 ? 0 : (result.prize / result.expectedPrize) * 100
  const verdict = percentile === null ? null : getLuckVerdict(percentile)
  const jackpotShare =
    result.expectedPrize === 0
      ? 0
      : ((result.expectedRankPrizes[0] + result.expectedRankPrizes[1]) /
          result.expectedPrize) *
        100

  return (
    <ReportSection
      step={1}
      title='한눈에 보기'
      description='핵심 지표와 결과 요약'
    >
      <Card>
        <CardContent className='space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            {verdict ? (
              <Badge
                className={cn(
                  verdict.tone === 'good' && 'bg-emerald-500 text-white',
                  verdict.tone === 'bad' && 'bg-destructive text-white'
                )}
                variant={verdict.tone === 'neutral' ? 'secondary' : 'default'}
              >
                {verdict.label}
              </Badge>
            ) : (
              <Badge variant='outline'>운 분석 중…</Badge>
            )}
            {percentile !== null && (
              <span className='text-muted-foreground text-sm'>
                무작위 1,000명 중 {formatTopPercent(percentile)}
              </span>
            )}
          </div>
          <p className='text-lg leading-relaxed font-medium sm:text-xl'>
            1,000원을 넣으면 평균{' '}
            <span
              className={cn('font-bold', profitClass(returnPer1000 - 1000))}
            >
              {Math.round(returnPer1000).toLocaleString()}원
            </span>
            을 돌려받았어요.
          </p>
          <p className='text-muted-foreground text-sm'>
            확률상 기대 당첨금 {formatWon(result.expectedPrize)}의{' '}
            <span className='text-foreground font-medium'>
              {expectedRatio.toFixed(0)}%
            </span>
            를 받았어요.{' '}
            {expectedRatio >= 100
              ? '확률보다 더 받은 셈이에요.'
              : '확률보다 덜 받은 셈이에요.'}{' '}
            다만 기대 당첨금의 {jackpotShare.toFixed(0)}%는 1·2등 몫이라, 1·2등
            없이는 대부분 기대치에 못 미쳐요.
          </p>
        </CardContent>
      </Card>

      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <StatTile
          label='순손익'
          value={formatSignedWon(result.netProfit)}
          valueClassName={profitClass(result.netProfit)}
        />
        <StatTile
          label='수익률'
          value={formatSignedPercent(result.profitRate)}
          valueClassName={profitClass(result.profitRate)}
        />
        <StatTile
          label='총 구매액'
          value={formatWon(result.spent)}
          hint={`${result.drawCount.toLocaleString()}회 × ${(
            result.gameCount / Math.max(1, result.drawCount)
          ).toLocaleString()}게임`}
        />
        <StatTile label='총 당첨금' value={formatWon(result.prize)} />
      </div>

      {result.best && (
        <Card>
          <CardContent className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <p className='text-muted-foreground text-sm'>최고 성적</p>
              <p className='font-semibold'>
                {result.best.rank}등 · {result.best.drawNo}회
                <span className='text-muted-foreground font-normal'>
                  {' '}
                  ({result.best.date})
                </span>
              </p>
            </div>
            <div className='flex flex-wrap gap-1'>
              {result.best.ticket.map((number) => (
                <NumberBall
                  key={number}
                  isSmall
                  isDeactivated={!result.best?.matchedNumbers.includes(number)}
                >
                  {number}
                </NumberBall>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </ReportSection>
  )
}
