import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { Otp } from '@/features/auth/otp'

export const Route = createFileRoute('/(auth)/otp')({
  head: () =>
    buildSeo({
      title: 'OTP 인증 | Lotto Simulator',
      description: '이메일로 받은 인증 코드를 입력하고 Lotto Simulator 계정에 로그인하세요.',
      path: '/otp',
      noIndex: true,
    }),
  component: Otp,
})
