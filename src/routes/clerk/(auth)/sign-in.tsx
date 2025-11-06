import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/clerk-react'
import { buildSeo } from '@/utils/seo'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/clerk/(auth)/sign-in')({
  head: () =>
    buildSeo({
      title: 'Clerk 로그인 데모 | Lotto Simulator',
      description: 'Clerk 위젯으로 로그인 플로우를 테스트하세요.',
      path: '/clerk/sign-in',
      noIndex: true,
    }),
  component: () => (
    <SignIn
      initialValues={{
        emailAddress: 'your_mail+shadcn_admin@gmail.com',
      }}
      fallback={<Skeleton className='h-[30rem] w-[25rem]' />}
    />
  ),
})
