import {
  type LottoFormSchema,
  lottoFormNames,
  lottoFormSchema,
} from '@/schemas/lotto'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEY_PREFIX, throttledStorage } from '@/lib/persist-storage'

const initialForms: LottoFormSchema[] = lottoFormNames.map((name) => ({
  name,
  isEnabled: true,
  numbers: [],
}))

interface FormState {
  formData: LottoFormSchema[]
  updateForm: (index: number, newFormData: LottoFormSchema) => void
}

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      formData: initialForms,
      updateForm: (index, newFormData) =>
        set((state) => {
          const newForms = [...state.formData]
          newForms[index] = newFormData
          return { formData: newForms }
        }),
    }),
    {
      name: `${STORAGE_KEY_PREFIX}:form`,
      version: 1,
      storage: throttledStorage,
      partialize: (state) => ({ formData: state.formData }),
      // 저장된 슬롯 구성이 현재와 다르거나 손상된 경우 기본값 사용
      merge: (persisted, current) => {
        const formData = (persisted as Partial<FormState> | undefined)?.formData
        const isValid =
          Array.isArray(formData) &&
          formData.length === initialForms.length &&
          formData.every(
            (form, index) =>
              form?.name === initialForms[index].name &&
              typeof form.isEnabled === 'boolean' &&
              Array.isArray(form.numbers)
          )
        return isValid ? { ...current, formData } : current
      },
    }
  )
)

export const selectValidForms = (state: FormState) =>
  state.formData.filter((form) => lottoFormSchema.safeParse(form).success)
