import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { SignIn2 } from '@/features/auth/sign-in/sign-in-2'

export const Route = createFileRoute('/(auth)/sign-in-2')({
  head: () =>
    buildSeo({
      title: '간편 로그인 | Lotto Simulator',
      description: '간편 로그인 방식으로 Lotto Simulator에 빠르게 접속하세요.',
      path: '/sign-in-2',
      noIndex: true,
    }),
  component: SignIn2,
})
