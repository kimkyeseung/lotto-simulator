import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@clerk/clerk-react'
import { buildSeo } from '@/utils/seo'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/clerk/(auth)/sign-up')({
  head: () =>
    buildSeo({
      title: 'Clerk 회원가입 데모 | Lotto Simulator',
      description: 'Clerk 위젯으로 회원가입 플로우를 체험해 보세요.',
      path: '/clerk/sign-up',
      noIndex: true,
    }),
  component: () => (
    <SignUp fallback={<Skeleton className='h-[30rem] w-[25rem]' />} />
  ),
})
