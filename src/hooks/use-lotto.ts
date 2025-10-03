import { useCallback, useEffect, useMemo } from 'react'
import { type LottoFormSchema } from '@/schemas/lotto'
import { useConfigStore } from '@/stores/config'
import { useResultStore } from '@/stores/result'

export function useLotto(validForms: LottoFormSchema[]) {
  const { isAutoRunning } = useConfigStore()
  const { submitLotto } = useResultStore()

  const isSubmitDisabled = useMemo(() => validForms.length === 0, [validForms])
  const cost = useMemo(() => validForms.length * 1000, [validForms])

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
  }
}
