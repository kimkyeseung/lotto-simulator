import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { ForgotPassword } from '@/features/auth/forgot-password'

export const Route = createFileRoute('/(auth)/forgot-password')({
  head: () =>
    buildSeo({
      title: '비밀번호 재설정 | Lotto Simulator',
      description: '등록된 이메일로 Lotto Simulator 계정 비밀번호를 재설정하세요.',
      path: '/forgot-password',
      noIndex: true,
    }),
  component: ForgotPassword,
})
