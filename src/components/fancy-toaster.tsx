import { type WinningRank } from '@/types/lotto'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { cn } from '@/lib/utils'

interface Props {
  rank: WinningRank
  prize: number
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

export function FancyToaster({ rank, prize }: Props) {
  if (rank === 0 || rank > 3) return null

  const style = rankStyles[rank]
  const emoji = rankEmojis[rank]

  return (
    <Card className={cn('gap-2 py-4 w-72 shadow-lg rounded-lg border-2', style)}>
      <CardHeader className='flex flex-row items-center justify-center space-y-0 pb-2 px-4 text-center'>
        <CardTitle className='text-md font-bold'>
          {`${emoji} ${rank}등 당첨을 축하합니다! ${emoji}`}
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4 text-center'>
        <p className='font-semibold text-base'>
          상금: {prize.toLocaleString()}원
        </p>
      </CardContent>
    </Card>
  )
}
