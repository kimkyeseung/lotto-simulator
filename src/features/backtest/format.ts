export const formatWon = (value: number) =>
  `${Math.round(value).toLocaleString()}원`

export const formatSignedWon = (value: number) =>
  `${value >= 0 ? '+' : ''}${formatWon(value)}`

export const formatSignedPercent = (value: number, digits = 1) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`

/** 차트 축용 축약 표기: 1.2억, 350만 */
export const formatCompactWon = (value: number) => {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(1)}억`
  if (abs >= 10_000)
    return `${sign}${Math.round(abs / 10_000).toLocaleString()}만`
  return `${sign}${Math.round(abs).toLocaleString()}`
}

export const profitClass = (value: number) =>
  value >= 0 ? 'text-emerald-500' : 'text-destructive'

export const PROFIT_COLOR = '#10b981'
export const LOSS_COLOR = '#f43f5e'

/** 기대 횟수 표기: 아주 작은 값도 0으로 보이지 않게 */
export const formatExpectedCount = (value: number) => {
  if (value >= 10) return Math.round(value).toLocaleString()
  if (value >= 0.01) return value.toFixed(2)
  if (value > 0) return value.toPrecision(1)
  return '0'
}

/** 무작위 플레이어 대비 백분위로 운을 판정 */
export function getLuckVerdict(percentile: number) {
  if (percentile >= 80) return { label: '운이 아주 좋았어요', tone: 'good' }
  if (percentile >= 60) return { label: '운이 좋은 편이에요', tone: 'good' }
  if (percentile >= 40)
    return { label: '딱 평균적인 결과예요', tone: 'neutral' }
  if (percentile >= 20) return { label: '운이 나쁜 편이에요', tone: 'bad' }
  return { label: '운이 아주 나빴어요', tone: 'bad' }
}

/** 상위 몇 %인지 (백분위 → 상위 비율) */
export const formatTopPercent = (percentile: number) =>
  `상위 ${Math.max(1, Math.round(100 - percentile))}%`

export const chartTooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--popover-foreground)',
  fontSize: 12,
}
