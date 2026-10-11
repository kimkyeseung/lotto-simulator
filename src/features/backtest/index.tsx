import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useShallow } from 'zustand/shallow'
import { useConfigStore } from '@/stores/config'
import { useFormStore } from '@/stores/form'
import { type DrawsFile, runBacktest } from '@/lib/backtest'
import { getPercentile } from '@/lib/backtest-insights'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { NumberBall } from '@/components/ui/number-ball'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShareButton } from '@/components/share-button'
import { LuckSection } from './components/luck-section'
import { NumbersSection } from './components/numbers-section'
import { OpportunitySection } from './components/opportunity-section'
import { SummarySection } from './components/summary-section'
import { TicketsSection } from './components/tickets-section'
import { TimelineSection } from './components/timeline-section'
import { useLuckSimulation } from './use-luck-simulation'

const RANGES = [
  { value: 'all', label: '전체', years: null },
  { value: '10y', label: '최근 10년', years: 10 },
  { value: '5y', label: '최근 5년', years: 5 },
  { value: '1y', label: '최근 1년', years: 1 },
] as const

type RangeValue = (typeof RANGES)[number]['value']

const PRIZE_RANKS = [1, 2, 3, 4, 5] as const

async function fetchDraws(): Promise<DrawsFile> {
  const response = await fetch('/data/draws.json')
  if (!response.ok) throw new Error('당첨번호 데이터를 불러오지 못했습니다.')
  return response.json()
}

function subtractYears(date: string, years: number) {
  const [year, rest] = [Number(date.slice(0, 4)), date.slice(4)]
  return `${year - years}${rest}`
}

export function Backtest() {
  const [range, setRange] = useState<RangeValue>('all')
  // 자동 번호가 포함된 경우 다시 돌릴 때마다 새 번호로 계산
  const [runId, setRunId] = useState(0)
  const prizeMap = useConfigStore((state) => state.prizeMap)
  const tickets = useFormStore(
    useShallow((state) => state.formData.filter((form) => form.isEnabled))
  )

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['draws'],
    queryFn: fetchDraws,
    staleTime: Infinity,
  })

  const draws = useMemo(() => {
    if (!data) return []
    const years = RANGES.find((r) => r.value === range)?.years
    if (!years) return data.draws
    const latestDate = data.draws[data.draws.length - 1].date
    const fromDate = subtractYears(latestDate, years)
    return data.draws.filter((draw) => draw.date > fromDate)
  }, [data, range])

  const result = useMemo(
    () =>
      draws.length === 0 || tickets.length === 0
        ? null
        : runBacktest(
            tickets.map((ticket) => ticket.numbers),
            draws,
            prizeMap
          ),
    // runId는 자동 번호 재추첨용
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draws, tickets, prizeMap, runId]
  )

  const luck = useLuckSimulation(draws, tickets.length, prizeMap)
  const percentile = useMemo(
    () =>
      result && luck.netProfits
        ? getPercentile(luck.netProfits, result.netProfit)
        : null,
    [result, luck.netProfits]
  )

  const ticketNumbers = useMemo(
    () => tickets.map((ticket) => ticket.numbers),
    [tickets]
  )
  const ticketNames = useMemo(
    () => tickets.map((ticket) => ticket.name),
    [tickets]
  )
  const hasAutoTicket = tickets.some((ticket) => ticket.numbers.length < 6)
  const firstDraw = draws[0]
  const lastDraw = draws[draws.length - 1]

  if (isPending) return <BacktestSkeleton />

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>당첨번호 데이터를 불러오지 못했어요</CardTitle>
          <CardDescription>잠시 후 다시 시도해 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>다시 시도</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader className='flex flex-row flex-wrap items-start justify-between gap-4'>
          <div className='space-y-1.5'>
            <CardTitle>매주 이 번호로 샀다면?</CardTitle>
            <CardDescription>
              {firstDraw && lastDraw
                ? `${firstDraw.no}회(${firstDraw.date}) ~ ${lastDraw.no}회(${lastDraw.date}) 실제 당첨번호와 당첨금 기준`
                : '실제 당첨번호와 당첨금 기준'}
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            {hasAutoTicket && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setRunId((id) => id + 1)}
              >
                <RefreshCw className='size-4' />
                자동 번호 다시 뽑기
              </Button>
            )}
            {result && firstDraw && lastDraw && (
              <ShareButton
                payload={{
                  v: 1,
                  kind: 'backtest',
                  rounds: result.drawCount,
                  games: result.gameCount,
                  spent: result.spent,
                  prize: result.prize,
                  ranks: PRIZE_RANKS.map((rank) => result.rankCounts[rank]),
                  from: firstDraw.no,
                  to: lastDraw.no,
                }}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Tabs value={range} onValueChange={(v) => setRange(v as RangeValue)}>
            <TabsList>
              {RANGES.map((r) => (
                <TabsTrigger key={r.value} value={r.value}>
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <TicketSummary
            tickets={tickets.map((t) => t.numbers)}
            names={tickets.map((t) => t.name)}
          />
        </CardContent>
      </Card>

      {result ? (
        <>
          <SummarySection result={result} percentile={percentile} />
          <LuckSection
            result={result}
            randomNetProfits={luck.netProfits}
            isSimulationFailed={luck.status === 'error'}
          />
          <TimelineSection result={result} />
          <NumbersSection
            result={result}
            draws={draws}
            tickets={ticketNumbers}
            ticketNames={ticketNames}
          />
          <TicketsSection result={result} ticketNames={ticketNames} />
          <OpportunitySection
            result={result}
            draws={draws}
            gamesPerDraw={tickets.length}
          />
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>사용 중인 용지가 없어요</CardTitle>
            <CardDescription>
              Overview 탭에서 용지를 하나 이상 켜고 번호를 골라 주세요. 번호를
              비워 두면 매주 자동으로 산 것으로 계산합니다.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

function TicketSummary({
  tickets,
  names,
}: {
  tickets: number[][]
  names: string[]
}) {
  if (tickets.length === 0) return null
  return (
    <div className='space-y-2'>
      {tickets.map((numbers, index) => (
        <div key={names[index]} className='flex items-center gap-2 text-sm'>
          <span className='text-muted-foreground w-4 font-medium'>
            {names[index]}
          </span>
          <div className='flex flex-wrap items-center gap-1'>
            {[...numbers]
              .sort((a, b) => a - b)
              .map((number) => (
                <NumberBall key={number} isSmall>
                  {number}
                </NumberBall>
              ))}
            {numbers.length < 6 && (
              <span className='text-muted-foreground text-xs'>
                {numbers.length === 0
                  ? '매주 자동'
                  : `+ 매주 자동 ${6 - numbers.length}개`}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function BacktestSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-40 w-full' />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className='h-24' />
        ))}
      </div>
      <Skeleton className='h-72 w-full' />
    </div>
  )
}
