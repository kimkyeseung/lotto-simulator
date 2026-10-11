import { Trophy } from 'lucide-react'
import type { BacktestResult, TicketKind, TicketStats } from '@/lib/backtest'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  formatSignedPercent,
  formatSignedWon,
  formatWon,
  profitClass,
} from '../format'
import { ReportSection } from './report-section'

const KIND_LABEL: Record<TicketKind, string> = {
  fixed: '고정',
  semi: '반자동',
  auto: '자동',
}

const profitRateOf = (ticket: Pick<TicketStats, 'spent' | 'prize'>) =>
  ticket.spent === 0 ? 0 : ((ticket.prize - ticket.spent) / ticket.spent) * 100

type TicketsSectionProps = {
  result: BacktestResult
  ticketNames: string[]
}

export function TicketsSection({ result, ticketNames }: TicketsSectionProps) {
  const tickets = result.tickets
  const bestIndex = tickets.reduce(
    (best, ticket, index) =>
      ticket.prize > tickets[best].prize ? index : best,
    0
  )
  const maxPrize = Math.max(...tickets.map((t) => t.prize), 1)
  const kindSummary = summarizeByKind(tickets)

  return (
    <ReportSection
      step={5}
      title='용지 비교'
      description='A~E 중 어떤 용지가 효자였는지'
    >
      <Card>
        <CardHeader>
          <CardTitle>용지별 성적</CardTitle>
          <CardDescription>
            {tickets.length > 1 && tickets[bestIndex].prize > 0
              ? `${ticketNames[bestIndex]} 용지가 가장 많이 받았어요 (${formatWon(tickets[bestIndex].prize)})`
              : tickets.length > 1
                ? '모든 용지가 한 번도 당첨되지 않았어요'
                : '용지가 하나뿐이에요. Overview에서 용지를 더 켜면 비교할 수 있어요.'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[560px] text-sm'>
              <thead className='text-muted-foreground text-xs'>
                <tr className='border-b'>
                  <th className='py-2 text-left font-medium'>용지</th>
                  <th className='py-2 text-left font-medium'>당첨금</th>
                  <th className='py-2 text-right font-medium'>손익</th>
                  <th className='py-2 text-right font-medium'>수익률</th>
                  <th className='py-2 text-right font-medium'>3등</th>
                  <th className='py-2 text-right font-medium'>4등</th>
                  <th className='py-2 text-right font-medium'>5등</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, index) => {
                  const net = ticket.prize - ticket.spent
                  const isBest =
                    tickets.length > 1 &&
                    index === bestIndex &&
                    ticket.prize > 0
                  return (
                    <tr
                      key={ticketNames[index]}
                      className='border-b last:border-0'
                    >
                      <td className='py-2.5'>
                        <div className='flex items-center gap-2'>
                          <span className='font-semibold'>
                            {ticketNames[index]}
                          </span>
                          <Badge variant='outline' className='text-[10px]'>
                            {KIND_LABEL[ticket.kind]}
                          </Badge>
                          {isBest && (
                            <Trophy className='size-4 text-amber-500' />
                          )}
                        </div>
                      </td>
                      <td className='py-2.5'>
                        <div className='flex items-center gap-2'>
                          <div className='bg-muted/50 h-2 w-24 overflow-hidden rounded-full'>
                            <div
                              className={cn(
                                'h-full rounded-full',
                                isBest ? 'bg-amber-500' : 'bg-primary/70'
                              )}
                              style={{
                                width: `${(ticket.prize / maxPrize) * 100}%`,
                              }}
                            />
                          </div>
                          <span className='tabular-nums'>
                            {formatWon(ticket.prize)}
                          </span>
                        </div>
                      </td>
                      <td
                        className={cn(
                          'py-2.5 text-right tabular-nums',
                          profitClass(net)
                        )}
                      >
                        {formatSignedWon(net)}
                      </td>
                      <td
                        className={cn(
                          'py-2.5 text-right tabular-nums',
                          profitClass(net)
                        )}
                      >
                        {formatSignedPercent(profitRateOf(ticket))}
                      </td>
                      {([3, 4, 5] as const).map((rank) => (
                        <td
                          key={rank}
                          className='py-2.5 text-right tabular-nums'
                        >
                          {ticket.rankCounts[rank]}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {kindSummary.length > 1 && (
            <div className='grid gap-3 sm:grid-cols-3'>
              {kindSummary.map((kind) => (
                <div key={kind.kind} className='bg-muted/40 rounded-md p-3'>
                  <p className='text-muted-foreground text-xs'>
                    {KIND_LABEL[kind.kind]} 용지 {kind.count}장 평균
                  </p>
                  <p
                    className={cn(
                      'text-lg font-semibold tabular-nums',
                      profitClass(kind.rate)
                    )}
                  >
                    {formatSignedPercent(kind.rate)}
                  </p>
                </div>
              ))}
            </div>
          )}
          <p className='text-muted-foreground text-xs'>
            {tickets.some((t) => t.kind !== 'fixed') &&
              '자동·반자동 용지는 매 회차 새로 뽑으므로 "자동 번호 다시 뽑기"를 누를 때마다 결과가 달라져요. '}
            고정 번호든 자동이든 1게임의 당첨 확률은 같아요.
          </p>
        </CardContent>
      </Card>
    </ReportSection>
  )
}

function summarizeByKind(tickets: TicketStats[]) {
  const groups = new Map<
    TicketKind,
    { spent: number; prize: number; count: number }
  >()
  for (const ticket of tickets) {
    const group = groups.get(ticket.kind) ?? { spent: 0, prize: 0, count: 0 }
    group.spent += ticket.spent
    group.prize += ticket.prize
    group.count += 1
    groups.set(ticket.kind, group)
  }
  return (['fixed', 'semi', 'auto'] as const)
    .filter((kind) => groups.has(kind))
    .map((kind) => {
      const group = groups.get(kind)!
      return { kind, count: group.count, rate: profitRateOf(group) }
    })
}
