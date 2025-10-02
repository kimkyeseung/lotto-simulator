'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { lottoFormSchema, type LottoFormSchema } from '@/schemas/lotto'
import { useConfigStore } from '@/stores/config'
import { useResultStore } from '@/stores/result'
import {
  generateLottoNumbers,
  normalizeAndCompleteLottoNumbers,
} from '@/lib/lotto'
import { LottoForm } from '@/components/lotto-form'
import { Button } from './ui/button'

const formNameMap = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E',
}

// 로또 폼의 초기 상태를 담을 배열
const initialForms: LottoFormSchema[] = Array.from({ length: 5 }, () => ({
  isEnabled: true,
  numbers: [],
}))

export function LottoTicketsForm() {
  const { isAutoRunning } = useConfigStore()

  const [formData, setFormData] = useState<LottoFormSchema[]>(initialForms)
  const validForms = useMemo(() => {
    return formData.filter((form) => lottoFormSchema.safeParse(form).success)
  }, [formData])

  const { setSubmittedTickets, setWinningNumbers, setUsedMoney } =
    useResultStore()

  const handleFormChange = (index: number, newFormData: LottoFormSchema) => {
    setFormData((prev) => {
      const newForms = [...prev]
      newForms[index] = newFormData
      return newForms
    })
  }

  const getWinningNumbers = useCallback(() => {
    const winningNumbers = generateLottoNumbers({ isContainBonusNumber: true })

    setWinningNumbers(winningNumbers)
  }, [setWinningNumbers])

  const isSubmitDisabled = validForms.length === 0

  const cost = validForms.length * 1000

  const onSubmit = useCallback(() => {
    if (!isSubmitDisabled) {
      setUsedMoney(cost)
      setSubmittedTickets(
        validForms.map((form) => normalizeAndCompleteLottoNumbers(form.numbers))
      )
      getWinningNumbers()
    }
  }, [
    isSubmitDisabled,
    setUsedMoney,
    cost,
    setSubmittedTickets,
    validForms,
    getWinningNumbers,
  ])

  useEffect(() => {
    if (isAutoRunning) {
      const interval = setInterval(() => {
        onSubmit()
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isAutoRunning, onSubmit])

  return (
    <div className='flex flex-col items-center space-y-4 bg-gray-50 p-8'>
      <div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-5'>
        {formData.map((_data, index) => (
          <LottoForm
            formName={formNameMap[index as keyof typeof formNameMap]}
            key={index}
            onFormChange={(newData) => handleFormChange(index, newData)}
          />
        ))}
      </div>
      <div>금액: {cost.toLocaleString()}원</div>
      <Button
        size={'lg'}
        onClick={onSubmit}
        disabled={isSubmitDisabled || isAutoRunning}
      >
        {isAutoRunning ? '자동 구매 진행 중...' : '구매하기'}
      </Button>
    </div>
  )
}
