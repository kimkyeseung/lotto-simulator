import { z } from 'zod'

// 로또 번호 배열의 기본 유효성 검사 스키마 (길이 제약 없음)
const baseLottoSchema = z
  .array(z.number().int().min(1).max(45))
  .superRefine((numbers, ctx) => {
    // 중복된 숫자가 있는지 확인
    if (new Set(numbers).size !== numbers.length) {
      ctx.addIssue({
        code: 'custom',
        message: '중복된 숫자가 있습니다.',
      })
    }
  })

// 최종 로또 티켓에 대한 스키마 (정확히 6개의 숫자를 요구)
export const lottoSchema = baseLottoSchema.length(6, {
  message: '로또 번호는 6개여야 합니다.',
})

// 로또 폼 입력을 위한 스키마 (6개 이하의 숫자를 허용)
export const lottoFormSchema = z
  .object({
    isEnabled: z.boolean(),
    numbers: baseLottoSchema.max(6, {
      message: '로또 번호는 6개를 초과할 수 없습니다.',
    }),
  })
  .refine((data) => data.isEnabled, {
    message: '활성화된 폼만 유효합니다.',
    path: ['isEnabled'], // 오류 메시지를 isEnabled 필드에 표시
  })

export type LottoSchema = z.infer<typeof lottoSchema>
export type LottoFormSchema = z.infer<typeof lottoFormSchema>
