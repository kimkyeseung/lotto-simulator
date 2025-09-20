'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lottoFormSchema, type LottoFormSchema } from '@/schemas/lotto'
import { NumberBall } from './ui/number-ball'
import { Switch } from './ui/switch'

// Tailwind CSS를 활용한 버튼 스타일
const numberButtonClass = (isSelected: boolean, isDisabled: boolean) =>
  `w-4 h-8 text-xs rounded-full border-1 transition-colors ${
    isDisabled
      ? 'bg-gray-200 border-gray-200 text-gray-500 cursor-not-allowed'
      : isSelected
        ? 'bg-primary border-primary text-white'
        : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
  }`

interface LottoFormProps {
  onFormChange: (data: LottoFormSchema) => void
  formName: string
}

export function LottoForm({ onFormChange, formName }: LottoFormProps) {
  const form = useForm<LottoFormSchema>({
    resolver: zodResolver(lottoFormSchema),
    defaultValues: {
      isEnabled: true,
      numbers: [],
    },
  })

  const { setValue, watch } = form

  const isEnabled = watch('isEnabled')
  const selectedNumbers = watch('numbers')

  // 폼 필드 값이 변경될 때마다 상위 컴포넌트로 전달
  useEffect(() => {
    const subscription = form.watch((value) => {
      onFormChange(value as LottoFormSchema)
    })
    return () => subscription.unsubscribe()
  }, [form, onFormChange])

  const handleNumberClick = (number: number) => {
    if (!isEnabled) return

    const newNumbers = selectedNumbers.includes(number)
      ? selectedNumbers.filter((n) => n !== number)
      : [...selectedNumbers, number]

    setValue('numbers', newNumbers, { shouldValidate: true })
  }

  return (
    <div className='flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm'>
      <div className='flex justify-center bg-gray-200 text-xs text-white'>
        {formName}
      </div>
      <div className='space-y-4 p-4'>
        <div className='flex items-center justify-end gap-2'>
          <label className='text-sm text-gray-800'>사용</label>
          <Switch
            checked={isEnabled}
            onCheckedChange={(value) => {
              setValue('isEnabled', value)
            }}
          />
        </div>
        <div
          className={`grid grid-cols-6 gap-2 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-10 ${isEnabled ? '' : 'opacity-50'}`}
        >
          {Array.from({ length: 45 }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              type='button'
              onClick={() => handleNumberClick(number)}
              className={numberButtonClass(
                selectedNumbers.includes(number),
                !isEnabled
              )}
              disabled={
                !isEnabled ||
                (!selectedNumbers.includes(number) &&
                  selectedNumbers.length >= 6)
              }
            >
              {number}
            </button>
          ))}
        </div>
        {isEnabled && (
          <div className='justify-endtext-gray-800'>
            선택된 번호:
            {selectedNumbers.length > 0 ? (
              <div className='flex gap-1'>
                {selectedNumbers
                  .sort((a, b) => a - b)
                  .map((number) => (
                    <NumberBall isSmall key={number}>
                      {number}
                    </NumberBall>
                  ))}
              </div>
            ) : (
              '없음'
            )}
          </div>
        )}
        {isEnabled && (
          <div className='text-sm text-gray-500'>
            {selectedNumbers.length !== 6 &&
              `${6 - selectedNumbers.length}개의 번호가 자동으로 선택`}
          </div>
        )}
      </div>
    </div>
  )
}
