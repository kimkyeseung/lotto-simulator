import { type WinningRank } from '@/types/lotto'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { NumberBall } from './ui/number-ball'

interface Props {
  rank: WinningRank
  prize: number
  numbers: number[]
  winningNumbers?: number[]
}

const rankStyles: Record<number, string> = {
  1: 'bg-yellow-300 border-yellow-500 text-yellow-900 shadow-yellow-500/50',
  2: 'bg-slate-200 border-slate-400 text-slate-800 shadow-slate-400/50',
  3: 'bg-orange-300 border-orange-500 text-orange-900 shadow-orange-500/50',
}

const rankEmojis: Record<number, string> = {
  1: '🎉🏆🎉',
  2: '🎉🎉',
  3: '🎉',
}

export function FancyToaster({
  rank,
  prize,
  numbers,
  winningNumbers = [],
}: Props) {
  if (rank === 0 || rank > 3) return null

  const style = rankStyles[rank]
  const emoji = rankEmojis[rank]

  const winningNumberMap = winningNumbers.reduce<Record<number, true>>(
    (acc, number) => {
      acc[number] = true
      return acc
    },
    {}
  )

  return (
    <Card
      className={cn('w-72 gap-2 rounded-lg border-2 py-4 shadow-lg', style)}
    >
      <CardHeader className='flex flex-row items-center justify-center space-y-0 px-4 pb-2 text-center'>
        <CardTitle className='text-md font-bold'>
          {`${emoji} ${rank}등 당첨을 축하합니다! ${emoji}`}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2 px-4 text-center'>
        <p className='text-base font-semibold'>
          상금: {prize.toLocaleString()}원
        </p>
        <div className='flex justify-center gap-2'>
          {numbers.map((number) => (
            <NumberBall key={number} isDeactivated={!winningNumberMap[number]}>
              {number}
            </NumberBall>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
