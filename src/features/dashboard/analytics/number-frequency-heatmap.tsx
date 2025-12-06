import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNumberHeatmapStats } from './hooks'
import { getIntensityClass, frequencyPalette } from './types'

export function NumberFrequencyHeatmap() {
  const { stats, maxFrequencyRatio } = useNumberHeatmapStats()

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>번호 빈도 히트맵</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='grid grid-cols-9 gap-2 text-xs'>
          {stats.map((item) => (
            <div
              key={item.number}
              className={`flex aspect-square flex-col items-center justify-center rounded-md p-1 ${getIntensityClass(item.frequencyRatio, maxFrequencyRatio, frequencyPalette)}`}
            >
              <span className='font-semibold'>{item.number}</span>
              <span>{(item.frequencyRatio * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
        <p className='text-muted-foreground text-xs'>
          숫자별 구매 빈도를 색상 농도로 나타냅니다. 진할수록 자주 선택된
          숫자입니다.
        </p>
      </CardContent>
    </Card>
  )
}
