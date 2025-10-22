import { type WinningRank } from '@/types/lotto'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { NumberBall } from './ui/number-ball'

interface Props {
  rank: WinningRank
  prize: number
  numbers: number[]
  winningNumbers?: number[]
}

export function CustomToaster({
  rank,
  prize,
  numbers,
  winningNumbers = [],
}: Props) {
  const winningNumberMap = winningNumbers.reduce<Record<number, true>>(
    (acc, number) => {
      acc[number] = true
      return acc
    },
    {}
  )
  return (
    <Card className='w-60 gap-2 rounded-sm py-4 shadow-lg'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 px-4 pb-2'>
        <CardTitle className='text-sm font-medium'>{`${rank}등 당첨!`}</CardTitle>
      </CardHeader>
      <CardContent className='px-4'>
        <p className='text-muted-foreground text-xs'>
          상금: {prize.toLocaleString()}원
        </p>

        <div className='flex justify-center gap-2'>
          {numbers.map((number) => (
            <NumberBall key={number} isDeactivated={!winningNumberMap[number]}>
              {number}
            </NumberBall>
          ))}
        </div>

        <p>{rank === 5 && '5등 당첨은 더 이상 표시하지 않습니다.'}</p>
      </CardContent>
    </Card>
  )
}
