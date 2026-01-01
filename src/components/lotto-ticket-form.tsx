'use client'

import { useCallback } from 'react'
import { useFormStore } from '@/stores/form'
import { useLotto } from '@/hooks/use-lotto'
import { Controller } from '@/components/controller'
import { LottoForm } from '@/components/lotto-form'
import type { LottoFormSchema } from '@/schemas/lotto'

export function LottoTicketsForm() {
  const { formData, updateForm } = useFormStore()
  const { cost } = useLotto()

  // Memoized callbacks for each form to prevent unnecessary re-renders
  const handleFormChangeA = useCallback(
    (newData: LottoFormSchema) => updateForm(0, newData),
    [updateForm]
  )
  const handleFormChangeB = useCallback(
    (newData: LottoFormSchema) => updateForm(1, newData),
    [updateForm]
  )
  const handleFormChangeC = useCallback(
    (newData: LottoFormSchema) => updateForm(2, newData),
    [updateForm]
  )
  const handleFormChangeD = useCallback(
    (newData: LottoFormSchema) => updateForm(3, newData),
    [updateForm]
  )
  const handleFormChangeE = useCallback(
    (newData: LottoFormSchema) => updateForm(4, newData),
    [updateForm]
  )

  const handlers = [
    handleFormChangeA,
    handleFormChangeB,
    handleFormChangeC,
    handleFormChangeD,
    handleFormChangeE,
  ]

  return (
    <div className='flex flex-col items-center space-y-4'>
      <div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-5'>
        {formData.map((t, index) => (
          <LottoForm
            formName={t.name}
            key={t.name}
            initialNumbers={t.numbers}
            onFormChange={handlers[index]}
          />
        ))}
      </div>
      <div>금액: {cost.toLocaleString()}원</div>

      <Controller />
    </div>
  )
}
