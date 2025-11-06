import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { ForbiddenError } from '@/features/errors/forbidden'

export const Route = createFileRoute('/(errors)/403')({
  head: () =>
    buildSeo({
      title: '403 - 접근이 제한되었습니다 | Lotto Simulator',
      description: '요청하신 페이지에 접근 권한이 없습니다. 필요한 권한을 확인하세요.',
      path: '/403',
      noIndex: true,
    }),
  component: ForbiddenError,
})
