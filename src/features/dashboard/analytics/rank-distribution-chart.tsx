import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts'
import { useResultStore } from '@/stores/result'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RankDistributionChart() {
  const winningRankCounts = useResultStore((state) => state.winningRankCounts)

  const data = useMemo(() => {
    const ranks = [1, 2, 3, 4, 5, 0] as const
    return ranks
      .map((rank) => ({
        rank,
        label: rank === 0 ? '낙첨' : `${rank}등`,
        count: winningRankCounts[rank] ?? 0,
      }))
      .filter((item) => item.count > 0)
  }, [winningRankCounts])

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>등수별 분포</CardTitle>
      </CardHeader>
      <CardContent className='h-[260px]'>
        {data.length ? (
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='label' />
              <YAxis tickFormatter={(value) => `${value}`} />
              <Tooltip
                formatter={(value) =>
                  `${(value as number).toLocaleString()} 회`
                }
              />
              <Bar
                dataKey='count'
                fill='hsl(var(--primary))'
                radius={[8, 8, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className='text-muted-foreground text-sm'>
            아직 당첨 데이터가 없습니다.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
