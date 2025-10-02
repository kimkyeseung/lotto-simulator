'use client'

import { useMemo, useState } from 'react'
import { lottoFormSchema, type LottoFormSchema } from '@/schemas/lotto'
import { useConfigStore } from '@/stores/config'
import { useLotto } from '@/hooks/use-lotto'
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
  const validForms = useMemo(
    () => formData.filter((form) => lottoFormSchema.safeParse(form).success),
    [formData]
  )

  const { onSubmit, isSubmitDisabled, cost } = useLotto(validForms)

  const handleFormChange = (index: number, newFormData: LottoFormSchema) => {
    setFormData((prev) => {
      const newForms = [...prev]
      newForms[index] = newFormData
      return newForms
    })
  }

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
