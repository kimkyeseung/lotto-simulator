import { useCallback, useEffect, useMemo } from 'react'
import { type LottoFormSchema } from '@/schemas/lotto'
import { useConfigStore } from '@/stores/config'
import { useResultStore } from '@/stores/result'
import {
  checkLottoResult,
  generateLottoNumbers,
  normalizeAndCompleteLottoNumbers,
} from '@/lib/lotto'

export function useLotto(validForms: LottoFormSchema[]) {
  const { isAutoRunning, prizeMap } = useConfigStore()
  const {
    setSubmittedTickets,
    setWinningNumbers,
    addUsedMoney,
    addTotalPrize,
    addSubmittedCount,
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
      const prize = prizeMap[result.rank as keyof typeof prizeMap] || 0
      return acc + prize
    }, 0)

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
