import { useCallback, useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { useConfigStore } from '@/stores/config'
import { selectValidForms, useFormStore } from '@/stores/form'
import { useResultStore } from '@/stores/result'

export function useLotto() {
  const { isAutoRunning } = useConfigStore()
  const { submitLotto, usedMoney, totalPrize } = useResultStore()

  const validForms = useFormStore(
    useShallow((state) => selectValidForms(state))
  )

  const isSubmitDisabled = useMemo(() => validForms.length === 0, [validForms])
  const cost = useMemo(() => validForms.length * 1000, [validForms])

  const profitRate = useMemo(() => {
    if (usedMoney === 0) return 0
    return (totalPrize / usedMoney) * 100
  }, [usedMoney, totalPrize])

  const onSubmit = useCallback(() => {
    if (isSubmitDisabled) {
      return
    }
    submitLotto(validForms)
  }, [isSubmitDisabled, submitLotto, validForms])

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
    profitRate,
  }
}
