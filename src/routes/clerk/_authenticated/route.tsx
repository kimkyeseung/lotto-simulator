import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/clerk/_authenticated')({
  head: () =>
    buildSeo({
      title: 'Clerk 인증 영역 | Lotto Simulator',
      description: 'Clerk 로그인 이후 접근 가능한 데모 대시보드입니다.',
      path: '/clerk/_authenticated',
      noIndex: true,
    }),
  component: AuthenticatedLayout,
})
