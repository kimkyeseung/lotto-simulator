import { useMemo } from 'react'
import { useResultStore } from '@/stores/result'

export function useHistoryData() {
  const history = useResultStore((state) => state.history)

  return useMemo(() => {
    if (!history.length) return []

    return history.map((entry) => ({
      id: entry.id,
      label: `${entry.submittedCount}회`,
      submittedCount: entry.submittedCount,
      netProfit: entry.netProfit,
      totalPrize: entry.totalPrize,
      usedMoney: entry.usedMoney,
      profitRate: entry.profitRate,
      timestamp: entry.timestamp,
    }))
  }, [history])
}

export function useNumberHeatmapStats() {
  const numberStatsMap = useResultStore((state) => state.numberStatsMap)

  return useMemo(() => {
    let maxFrequencyRatio = 0
    let maxHitRate = 0
    let totalSubmittedCount = 0

    // 전체 구매 횟수 계산
    Object.values(numberStatsMap).forEach((stats) => {
      totalSubmittedCount += stats.submittedCount
    })

    const stats = Array.from({ length: 45 }, (_, index) => {
      const number = index + 1
      const statsForNumber = numberStatsMap[number]
      const submittedCount = statsForNumber?.submittedCount ?? 0
      const hitCount = statsForNumber?.hitCount ?? 0
      const resultCount = statsForNumber?.resultCount ?? 0

      // 구매 빈도 비율 (전체 대비)
      const frequencyRatio =
        totalSubmittedCount > 0 ? submittedCount / totalSubmittedCount : 0

      // 적중률 (구매 대비 적중 비율)
      const hitRate = submittedCount > 0 ? (hitCount / submittedCount) * 100 : 0

      if (frequencyRatio > maxFrequencyRatio) {
        maxFrequencyRatio = frequencyRatio
      }
      if (hitRate > maxHitRate) {
        maxHitRate = hitRate
      }

      return {
        number,
        submittedCount,
        hitCount,
        resultCount,
        frequencyRatio,
        hitRate,
      }
    })

    return { stats, maxFrequencyRatio, maxHitRate }
  }, [numberStatsMap])
}
