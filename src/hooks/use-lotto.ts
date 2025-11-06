import { useCallback, useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { useConfigStore } from '@/stores/config'
import { selectValidForms, useFormStore } from '@/stores/form'
import { useResultStore } from '@/stores/result'

type UseLottoOptions = {
  enableAutoRunner?: boolean
}

export function useLotto(options?: UseLottoOptions) {
  const { isAutoRunning } = useConfigStore()
  const { submitLotto, usedMoney, totalPrize } = useResultStore()

  const validForms = useFormStore(
    useShallow((state) => selectValidForms(state))
  )

  const enableAutoRunner = options?.enableAutoRunner ?? false

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
    if (!enableAutoRunner) return
    if (!isAutoRunning) return

    let timeoutId: number // ID를 저장할 변수

    const runSimulation = () => {
      onSubmit()
      // 현재 작업이 완료된 후, 다음 작업을 예약
      timeoutId = window.setTimeout(runSimulation, 100)
    }

    runSimulation()

    // 클린업 함수: 타이머 해제
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [enableAutoRunner, isAutoRunning, onSubmit])

  return {
    validForms,
    onSubmit,
    isSubmitDisabled,
    cost,
    profitRate,
  }
}
