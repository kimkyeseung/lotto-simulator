'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lottoFormSchema, type LottoFormSchema } from '@/schemas/lotto'
import { useResultStore } from '@/stores/result'
import { NumberBall } from './ui/number-ball'
import { Switch } from './ui/switch'

// Tailwind CSS를 활용한 버튼 스타일
// isSelected: 사용자가 직접 선택한 번호
// isSubmitted: 제출된 번호 (자동 선택 포함)
const numberButtonClass = (
  isSelected: boolean,
  isDisabled: boolean,
  isSubmitted: boolean
) =>
  `w-4 h-8 text-xs rounded-full border-1 transition-all ${
    isDisabled
      ? 'bg-muted border-muted text-muted-foreground cursor-not-allowed'
      : isSelected
        ? 'bg-primary border-primary text-primary-foreground'
        : isSubmitted
          ? 'bg-background border-primary text-foreground hover:bg-accent'
          : 'bg-background border-border text-foreground hover:bg-accent'
  }`

interface LottoFormProps {
  onFormChange: (data: LottoFormSchema) => void
  formName: LottoFormSchema['name']
  initialNumbers?: number[]
}

export function LottoForm({ onFormChange, formName, initialNumbers = [] }: LottoFormProps) {
  const form = useForm<LottoFormSchema>({
    resolver: zodResolver(lottoFormSchema),
    defaultValues: {
      name: formName,
      isEnabled: true,
      numbers: initialNumbers,
    },
  })

  const { setValue, watch } = form

  const isEnabled = watch('isEnabled')
  const submittedTickets = useResultStore((state) => state.submittedTickets)
  const [submittedNumbers, setSubmittedNumbers] = useState<number[]>([])
  // 사용자가 수동으로 선택한 번호만 별도 관리 (초기값은 props에서)
  const [manuallySelectedNumbers, setManuallySelectedNumbers] = useState<number[]>(initialNumbers)

  // 폼 필드 값이 변경될 때마다 상위 컴포넌트로 전달
  useEffect(() => {
    const subscription = form.watch((value) => {
      onFormChange(value as LottoFormSchema)
    })
    return () => subscription.unsubscribe()
  }, [form, onFormChange])

  // 제출된 티켓에서 현재 폼의 번호 추출 (표시용)
  useEffect(() => {
    if (submittedTickets.length > 0) {
      const formIndex = formName.charCodeAt(0) - 'A'.charCodeAt(0)
      const ticket = submittedTickets[formIndex]

      if (ticket) {
        setSubmittedNumbers(ticket)
      }
    }
  }, [submittedTickets, formName])

  const handleNumberClick = (number: number) => {
    if (!isEnabled) return

    const isCurrentlySelected = manuallySelectedNumbers.includes(number)
    const newNumbers = isCurrentlySelected
      ? manuallySelectedNumbers.filter((n) => n !== number)
      : [...manuallySelectedNumbers, number]

    setManuallySelectedNumbers(newNumbers)
    setValue('numbers', newNumbers, { shouldValidate: true })
  }

  return (
    <div className='flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm'>
      <div className='flex justify-center bg-muted text-xs text-muted-foreground font-medium'>
        {formName}
      </div>
      <div className='space-y-4 p-2 md:p-4'>
        <div className='flex items-center justify-end gap-2'>
          <label className='text-sm text-foreground'>사용</label>
          <Switch
            checked={isEnabled}
            onCheckedChange={(value) => {
              setValue('isEnabled', value)
            }}
          />
        </div>
        <div
          className={`grid grid-cols-12 gap-2 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-10 ${isEnabled ? '' : 'opacity-50'}`}
        >
          {Array.from({ length: 45 }, (_, i) => i + 1).map((number) => {
            const isManuallySelected = manuallySelectedNumbers.includes(number)
            const isSubmittedOnly =
              submittedNumbers.includes(number) && !isManuallySelected

            return (
              <button
                key={number}
                type='button'
                onClick={() => handleNumberClick(number)}
                className={numberButtonClass(isManuallySelected, !isEnabled, isSubmittedOnly)}
                disabled={
                  !isEnabled ||
                  (!manuallySelectedNumbers.includes(number) &&
                    manuallySelectedNumbers.length >= 6)
                }
              >
                {number}
              </button>
            )
          })}
        </div>
        {isEnabled && (
          <div className='text-foreground'>
            선택된 번호:
            {manuallySelectedNumbers.length > 0 ? (
              <div className='flex gap-1'>
                {manuallySelectedNumbers
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
          <div className='text-sm text-muted-foreground'>
            {manuallySelectedNumbers.length !== 6 &&
              `${6 - manuallySelectedNumbers.length}개의 번호가 자동으로 선택`}
          </div>
        )}
      </div>
    </div>
  )
}
