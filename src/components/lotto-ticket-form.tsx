'use client'

import { useFormStore } from '@/stores/form'
import { useLotto } from '@/hooks/use-lotto'
import { Controller } from '@/components/controller'
import { LottoForm } from '@/components/lotto-form'

const formNameMap = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E',
}

export function LottoTicketsForm() {
  const { formData, updateForm } = useFormStore()
  const { cost } = useLotto()

  return (
    <div className='flex flex-col items-center space-y-4'>
      <div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-5'>
        {formData.map((_data, index) => (
          <LottoForm
            formName={formNameMap[index as keyof typeof formNameMap]}
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
