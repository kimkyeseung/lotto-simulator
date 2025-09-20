'use client'

import { useMemo, useState } from 'react'
import { lottoFormSchema, type LottoFormSchema } from '@/schemas/lotto'
import { useResultStore } from '@/stores/result'
import {
  generateLottoNumbers,
  normalizeAndCompleteLottoNumbers,
} from '@/lib/lotto'
import { LottoForm } from '@/components/lotto-form'

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
  const [formData, setFormData] = useState<LottoFormSchema[]>(initialForms)
  const validForms = useMemo(() => {
    return formData.filter((form) => lottoFormSchema.safeParse(form).success)
  }, [formData])

  const { setSubmittedTickets, setWinningNumbers } = useResultStore()

  const handleFormChange = (index: number, newFormData: LottoFormSchema) => {
    setFormData((prev) => {
      const newForms = [...prev]
      newForms[index] = newFormData
      return newForms
    })
  }

  function getWinningNumbers() {
    const winningNumbers = generateLottoNumbers({ isContainBonusNumber: true })

    setWinningNumbers(winningNumbers)
  }

  const isSubmitDisabled = validForms.length === 0

  const onSubmit = () => {
    if (!isSubmitDisabled) {
      setSubmittedTickets(
        validForms.map((form) => normalizeAndCompleteLottoNumbers(form.numbers))
      )
      getWinningNumbers()
    }
  }

  return (
    <div className='flex flex-col items-center space-y-8 bg-gray-50 p-8'>
      <div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-5'>
        {formData.map((_data, index) => (
          <LottoForm
            formName={formNameMap[index as keyof typeof formNameMap]}
            key={index}
            onFormChange={(newData) => handleFormChange(index, newData)}
          />
        ))}
      </div>
      <div>금액: {validForms.length * 1000}원</div>
      <button
        onClick={onSubmit}
        className='mt-6 rounded-lg bg-purple-600 px-8 py-4 font-bold text-white shadow-lg transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50'
        disabled={isSubmitDisabled}
      >
        구매하기
      </button>
    </div>
  )
}
