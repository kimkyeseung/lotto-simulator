import { useMemo } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { decodeSharePayload, getProfitRate, getShareTitle } from '@/lib/share'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SharedResult() {
  const hash = useLocation({ select: (location) => location.hash })
  const payload = useMemo(() => decodeSharePayload(hash), [hash])

  return (
    <div className='bg-background flex min-h-svh items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        {payload ? (
          <SharedResultContent payload={payload} />
        ) : (
          <CardHeader>
            <CardTitle>결과를 불러올 수 없어요</CardTitle>
            <CardDescription>
              공유 링크가 올바르지 않거나 일부가 잘렸습니다.
            </CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <Button asChild className='w-full' size='lg'>
            <Link to='/'>나도 시뮬레이션 해보기</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function SharedResultContent({
  payload,
}: {
  payload: NonNullable<ReturnType<typeof decodeSharePayload>>
}) {
  const net = payload.prize - payload.spent
  const sign = net >= 0 ? '+' : ''
  const accent = net >= 0 ? 'text-emerald-500' : 'text-destructive'

  return (
    <>
      <CardHeader>
        <CardDescription>
          {payload.kind === 'backtest'
            ? '역대 당첨번호 백테스트'
            : '시뮬레이션'}
        </CardDescription>
        <CardTitle className='text-xl'>{getShareTitle(payload)}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-5'>
        <div>
          <p className='text-muted-foreground text-sm'>순손익</p>
          <p className={cn('text-3xl font-bold tabular-nums', accent)}>
            {sign}
            {net.toLocaleString()}원
          </p>
          <p className={cn('font-semibold tabular-nums', accent)}>
            수익률 {sign}
            {getProfitRate(payload).toFixed(1)}%
          </p>
        </div>
        <dl className='grid grid-cols-3 gap-2 text-sm'>
          <Stat label='게임 수' value={`${payload.games.toLocaleString()}`} />
          <Stat label='구매' value={`${payload.spent.toLocaleString()}원`} />
          <Stat label='당첨' value={`${payload.prize.toLocaleString()}원`} />
        </dl>
        <dl className='grid grid-cols-5 gap-2 text-center text-sm'>
          {payload.ranks.map((rankCount, index) => (
            <div key={index} className='bg-muted rounded-md py-2'>
              <dt className='text-muted-foreground text-xs'>{index + 1}등</dt>
              <dd className='font-semibold tabular-nums'>
                {rankCount.toLocaleString()}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='bg-muted rounded-md p-2'>
      <dt className='text-muted-foreground text-xs'>{label}</dt>
      <dd className='truncate font-semibold tabular-nums'>{value}</dd>
    </div>
  )
}
