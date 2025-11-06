import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { SignUp } from '@/features/auth/sign-up'

export const Route = createFileRoute('/(auth)/sign-up')({
  head: () =>
    buildSeo({
      title: '회원가입 | Lotto Simulator',
      description: '로또 자동 구매와 당첨 통계를 관리할 수 있는 Lotto Simulator 계정을 만들어 보세요.',
      path: '/sign-up',
      noIndex: true,
    }),
  component: SignUp,
})
