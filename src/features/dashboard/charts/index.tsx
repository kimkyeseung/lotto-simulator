import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useResultStore } from '@/stores/result'
import { CustomTooltip } from './custom-tooltip'

export function Charts() {
  const { numberStatsMap } = useResultStore()
  const data = Object.entries(numberStatsMap).map(([number, stats]) => ({
    number,
    hitCount: stats.hitCount,
    submittedCount: stats.submittedCount,
    resultCount: stats.resultCount,
  }))

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data} barGap={0}>
        <CartesianGrid strokeDasharray='1' />
        <XAxis
          dataKey='number'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip content={CustomTooltip} />
        <Legend />
        <Bar dataKey='submittedCount' fill='#8884d8' />
        <Bar dataKey='resultCount' fill='#82ca9d' />
        <Bar dataKey='hitCount' fill='currentColor' className='fill-primary' />
      </BarChart>
    </ResponsiveContainer>
  )
}
