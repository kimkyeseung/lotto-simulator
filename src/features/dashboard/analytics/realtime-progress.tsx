import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHistoryData } from './hooks'
import { currencyFormatter, percentFormatter } from './utils'

export function RealtimeProgress() {
  const historyData = useHistoryData()

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>실시간 진행률</CardTitle>
      </CardHeader>
      <CardContent className='h-[280px]'>
        {historyData.length ? (
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='label' />
              <YAxis
                yAxisId='left'
                tickFormatter={(value) => `${currencyFormatter(value / 1000)}k`}
              />
              <YAxis
                yAxisId='right'
                orientation='right'
                tickFormatter={(value) => percentFormatter(value)}
              />
              <Tooltip
                formatter={(value, _name, item) => {
                  if (item?.dataKey === 'profitRate') {
                    return [`${(value as number).toFixed(2)}%`, '수익률']
                  }
                  return [`${currencyFormatter(value as number)} 원`, '순이익']
                }}
              />
              <Line
                type='monotone'
                yAxisId='left'
                dataKey='netProfit'
                name='순이익'
                stroke='hsl(var(--primary))'
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type='monotone'
                yAxisId='right'
                dataKey='profitRate'
                name='수익률'
                stroke='#16a34a'
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className='text-muted-foreground text-sm'>
            아직 데이터가 없습니다. 시뮬레이션을 시작해보세요.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
