import { type TooltipContentProps } from 'recharts'
import {
  type NameType,
  type ValueType,
} from 'recharts/types/component/DefaultTooltipContent'
import { formatDecimal } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberBall } from '@/components/ui/number-ball'

const labelMap = {
  submittedCount: '구매',
  hitCount: '적중',
  resultCount: '결과',
}

interface Payload {
  name: keyof typeof labelMap
  value: number
  payload: {
    [K in keyof typeof labelMap]: number
  }
}

export function CustomTooltip({
  active,
  payload,
  label,
}: TooltipContentProps<ValueType, NameType>) {
  const isVisible = active && payload && payload.length

  if (!isVisible) {
    return null
  }

  // payload에서 각 값을 안전하게 추출
  const getPayloadValue = (name: keyof typeof labelMap): number => {
    const item = payload.find((p) => p.name === name)
    return (item?.value as number) ?? 0
  }

  const submittedCount = getPayloadValue('submittedCount')
  const hitCount = getPayloadValue('hitCount')

  const hitRate = formatDecimal((hitCount / submittedCount) * 100 || 0)

  return (
    <Card className='gap-2 py-4 opacity-80'>
      <CardHeader className='px-4'>
        <CardTitle>
          <NumberBall>{label as number}</NumberBall>
        </CardTitle>
      </CardHeader>

      <CardContent className='text-sm'>
        {payload.map((p: Payload, index) => (
          <div key={index} className='flex gap-2'>
            <p className='text-muted-foreground'>{labelMap[p.name]}:</p>
            <p>{p.value}회</p>
          </div>
        ))}
        {submittedCount > 0 && (
          <div className='mt-1'>적중률: {hitRate}%</div>
        )}
      </CardContent>
    </Card>
  )
}
