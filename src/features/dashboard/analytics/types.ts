export type HeatmapPalette = {
  zero: string
  low: string
  medium: string
  mediumHigh: string
  high: string
}

export const frequencyPalette: HeatmapPalette = {
  zero: 'bg-muted text-muted-foreground',
  low: 'bg-emerald-50 text-emerald-900',
  medium: 'bg-emerald-200 text-emerald-900',
  mediumHigh: 'bg-emerald-300 text-white',
  high: 'bg-emerald-600 text-white',
}

export const hitPalette: HeatmapPalette = {
  zero: 'bg-muted text-muted-foreground',
  low: 'bg-blue-200 text-blue-900',
  medium: 'bg-blue-400 text-blue-950',
  mediumHigh: 'bg-blue-500 text-white',
  high: 'bg-blue-600 text-white',
}

export const resultPalette: HeatmapPalette = {
  zero: 'bg-muted text-muted-foreground',
  low: 'bg-amber-200 text-amber-900',
  medium: 'bg-amber-400 text-amber-950',
  mediumHigh: 'bg-amber-500 text-white',
  high: 'bg-amber-600 text-white',
}

export const getIntensityClass = (count: number, maxCount: number, palette: HeatmapPalette) => {
  if (maxCount === 0) return palette.zero
  const ratio = count / maxCount
  if (ratio > 0.75) return palette.high
  if (ratio > 0.5) return palette.mediumHigh
  if (ratio > 0.25) return palette.medium
  if (ratio > 0) return palette.low
  return palette.zero
}
