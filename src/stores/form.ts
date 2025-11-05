import {
  type LottoFormSchema,
  lottoFormNames,
  lottoFormSchema,
} from '@/schemas/lotto'
import { create } from 'zustand'

const initialForms: LottoFormSchema[] = lottoFormNames.map((name) => ({
  name,
  isEnabled: true,
  numbers: [],
}))

interface FormState {
  formData: LottoFormSchema[]
  updateForm: (index: number, newFormData: LottoFormSchema) => void
}

export const useFormStore = create<FormState>((set) => ({
  formData: initialForms,
  updateForm: (index, newFormData) =>
    set((state) => {
      const newForms = [...state.formData]
      newForms[index] = newFormData
      return { formData: newForms }
    }),
}))

export const selectValidForms = (state: FormState) =>
  state.formData.filter((form) => lottoFormSchema.safeParse(form).success)
