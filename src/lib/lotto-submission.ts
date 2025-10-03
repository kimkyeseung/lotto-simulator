import { type SimulationStats } from '@/types/lotto'

export const updateNumberStats = (
  currentStatsMap: Record<number, SimulationStats>,
  submittedNumbers: number[],
  matchedNumbers: number[]
) => {
  const newStats = { ...currentStatsMap }

  // 통계 업데이트를 처리하는 헬퍼 함수
  const updateStat = (num: number, key: keyof SimulationStats) => {
    if (!newStats[num]) {
      newStats[num] = { submittedCount: 0, hitCount: 0, resultCount: 0 }
    }
    newStats[num][key] += 1
  }

  submittedNumbers.forEach((num) => updateStat(num, 'submittedCount'))
  matchedNumbers.forEach((num) => updateStat(num, 'hitCount'))

  return newStats
}

export const updateWinningNumberStats = (
  currentStatsMap: Record<number, SimulationStats>,
  winningNumbers: number[]
) => {
  const newStats = { ...currentStatsMap }

  // 통계 업데이트를 처리하는 헬퍼 함수
  const updateStat = (num: number, key: keyof SimulationStats) => {
    if (!newStats[num]) {
      newStats[num] = { submittedCount: 0, hitCount: 0, resultCount: 0 }
    }
    newStats[num][key] += 1
  }
  winningNumbers.forEach((num) => updateStat(num, 'resultCount'))

  return newStats
}
