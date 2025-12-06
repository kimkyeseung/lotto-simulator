import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNumberHeatmapStats } from './hooks'
import { getIntensityClass, resultPalette } from './types'

export function RecommendedNumbersHeatmap() {
  const { stats } = useNumberHeatmapStats()

  const maxResultCount = useMemo(() => {
    return Math.max(...stats.map((s) => s.resultCount), 0)
  }, [stats])

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>추천번호 등장 히트맵</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='grid grid-cols-9 gap-2 text-xs'>
          {stats.map((item) => (
            <div
              key={item.number}
              className={`flex aspect-square flex-col items-center justify-center rounded-md p-1 ${getIntensityClass(item.resultCount, maxResultCount, resultPalette)}`}
            >
              <span className='font-semibold'>{item.number}</span>
              <span>{item.resultCount}</span>
            </div>
          ))}
        </div>
        <p className='text-muted-foreground text-xs'>
          추첨 번호로 등장한 횟수를 표시합니다. 진할수록 자주 추첨된 번호입니다.
        </p>
      </CardContent>
    </Card>
  )
}
