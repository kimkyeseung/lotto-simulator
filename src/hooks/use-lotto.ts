import { useCallback, useEffect, useMemo } from 'react'
import { type LottoFormSchema } from '@/schemas/lotto'
import { type SimulationStats } from '@/types/lotto'
import { useConfigStore } from '@/stores/config'
import { useResultStore } from '@/stores/result'
import {
  checkLottoResult,
  generateLottoNumbers,
  normalizeAndCompleteLottoNumbers,
} from '@/lib/lotto'

const updateNumberStats = (
  currentStatsMap: Record<number, SimulationStats>,
  submittedNumbers: number[],
  matchedNumbers: number[]
) => {
  // 깊은 복사 대신, 필요한 키만 업데이트하는 방식 사용
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
  // winningNumbers.forEach((num) => updateStat(num, 'resultCount'))

  return newStats
}

const updateWinningNumberStats = (
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

export function useLotto(validForms: LottoFormSchema[]) {
  const { isAutoRunning, prizeMap } = useConfigStore()
  const {
    setSubmittedTickets,
    setWinningNumbers,
    addUsedMoney,
    addTotalPrize,
    addSubmittedCount,
    setNumberStatsMap,
  } = useResultStore()

  const getWinningNumbers = useCallback(() => {
    const winningNumbers = generateLottoNumbers({ isContainBonusNumber: true })
    setWinningNumbers(winningNumbers)

    return winningNumbers
  }, [setWinningNumbers])

  const isSubmitDisabled = useMemo(() => validForms.length === 0, [validForms])
  const cost = useMemo(() => validForms.length * 1000, [validForms])

  const onSubmit = useCallback(() => {
    if (isSubmitDisabled) {
      return
    }

    addSubmittedCount(1)
    addUsedMoney(cost)
    const normalizedForms = validForms.map((form) =>
      normalizeAndCompleteLottoNumbers(form.numbers)
    )
    setSubmittedTickets(normalizedForms)
    const winningNumbers = getWinningNumbers()

    const prizes = normalizedForms.reduce((acc, form) => {
      const result = checkLottoResult(form, winningNumbers)
      setNumberStatsMap((currentStatsMap) =>
        updateNumberStats(currentStatsMap, form, result.matchedNumbers)
      )
      const prize = prizeMap[result.rank as keyof typeof prizeMap] || 0
      return acc + prize
    }, 0)
    setNumberStatsMap((currentStats) =>
      updateWinningNumberStats(currentStats, winningNumbers)
    )

    addTotalPrize(prizes)
  }, [
    isSubmitDisabled,
    addSubmittedCount,
    addUsedMoney,
    cost,
    validForms,
    setSubmittedTickets,
    getWinningNumbers,
    addTotalPrize,
    setNumberStatsMap,
    prizeMap,
  ])

  useEffect(() => {
    if (isAutoRunning) {
      const interval = setInterval(() => {
        onSubmit()
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isAutoRunning, onSubmit])

  return {
    onSubmit,
    isSubmitDisabled,
    cost,
  }
}
