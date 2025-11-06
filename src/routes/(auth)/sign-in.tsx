import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { SignIn } from '@/features/auth/sign-in'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  head: () =>
    buildSeo({
      title: '로그인 | Lotto Simulator',
      description: 'Lotto Simulator 계정으로 로그인하고 로또 시뮬레이션 기록을 관리하세요.',
      path: '/sign-in',
      noIndex: true,
    }),
  component: SignIn,
  validateSearch: searchSchema,
})
