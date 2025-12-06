import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNumberHeatmapStats } from './hooks'
import { getIntensityClass, hitPalette } from './types'

export function NumberHitFrequencyHeatmap() {
  const { stats, maxHitRate } = useNumberHeatmapStats()

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>번호별 적중 빈도 히트맵</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='grid grid-cols-9 gap-2 text-xs'>
          {stats.map((item) => (
            <div
              key={item.number}
              className={`flex aspect-square flex-col items-center justify-center rounded-md p-1 ${getIntensityClass(item.hitRate, maxHitRate, hitPalette)}`}
            >
              <span className='font-semibold'>{item.number}</span>
              <span>{item.hitRate.toFixed(1)}%</span>
            </div>
          ))}
        </div>
        <p className='text-muted-foreground text-xs'>
          추첨 결과에서 적중한 횟수를 기준으로 색상을 표시합니다. 진할수록 더
          자주 당첨된 숫자입니다.
        </p>
      </CardContent>
    </Card>
  )
}
