import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useShallow } from 'zustand/shallow'
import { useResultStore } from '@/stores/result'
import { Button } from '@/components/ui/button'
import { CustomTooltip } from './custom-tooltip'

const SERIES = [
  {
    key: 'submittedCount',
    label: '구매 횟수',
    color: 'hsl(var(--muted-foreground))',
  },
  {
    key: 'resultCount',
    label: '추첨 결과 수',
    color: 'hsl(var(--secondary))',
  },
  {
    key: 'hitCount',
    label: '적중 횟수',
    color: 'hsl(var(--primary))',
  },
] as const

export function Charts() {
  const numberStatsMap = useResultStore(
    useShallow((state) => state.numberStatsMap)
  )
  const [activeKeys, setActiveKeys] = useState<string[]>(SERIES.map((series) => series.key))

  const data = useMemo(() => {
    return Object.entries(numberStatsMap)
      .map(([number, stats]) => ({
        number: Number(number),
        hitCount: stats.hitCount,
        submittedCount: stats.submittedCount,
        resultCount: stats.resultCount,
      }))
      .sort((a, b) => a.number - b.number)
  }, [numberStatsMap])

  const hasChartData = data.some(
    (item) => item.submittedCount || item.resultCount || item.hitCount
  )

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='text-muted-foreground text-xs uppercase tracking-wide'>
            번호별 빈도 비교
          </p>
          <h3 className='text-base font-semibold'>구매 · 추첨 · 적중 통계</h3>
        </div>
        <div className='flex flex-wrap gap-2 text-xs'>
          {SERIES.map((series) => {
            const isActive = activeKeys.includes(series.key)
            return (
              <Button
                key={series.key}
                variant={isActive ? 'secondary' : 'outline'}
                size='sm'
                className='flex items-center gap-2'
                onClick={() => {
                  setActiveKeys((prev) => {
                    if (isActive) {
                      if (prev.length === 1) return prev
                      return prev.filter((key) => key !== series.key)
                    }
                    return [...prev, series.key]
                  })
                }}
              >
                <span
                  className='inline-block size-2.5 rounded-full'
                  style={{ backgroundColor: series.color }}
                  aria-hidden='true'
                />
                {series.label}
              </Button>
            )
          })}
        </div>
      </div>

      {hasChartData ? (
        <ResponsiveContainer width='100%' height={360}>
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
            <XAxis
              dataKey='number'
              stroke='hsl(var(--muted-foreground))'
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke='hsl(var(--muted-foreground))'
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={CustomTooltip} cursor={{ fill: 'hsl(var(--muted) / 0.35)' }} />
            {SERIES.filter((series) => activeKeys.includes(series.key)).map((series) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                fill={series.color}
                isAnimationActive={false}
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className='border border-dashed border-muted-foreground/40 rounded-lg p-6 text-center text-sm text-muted-foreground'>
      아직 시뮬레이션 데이터가 없습니다. 티켓을 구매해 통계를 확인해보세요.
    </div>
  )
}
