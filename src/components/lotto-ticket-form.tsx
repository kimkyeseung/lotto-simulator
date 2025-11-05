'use client'

import { useFormStore } from '@/stores/form'
import { useLotto } from '@/hooks/use-lotto'
import { Controller } from '@/components/controller'
import { LottoForm } from '@/components/lotto-form'

export function LottoTicketsForm() {
  const { formData, updateForm } = useFormStore()
  const { cost } = useLotto()

  return (
    <div className='flex flex-col items-center space-y-4'>
      <div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-5'>
        {formData.map((t, index) => (
          <LottoForm
            formName={t.name}
            key={index}
            onFormChange={(newData) => updateForm(index, newData)}
          />
        ))}
      </div>
      <div>금액: {cost.toLocaleString()}원</div>

      <Controller />
    </div>
  )
}
