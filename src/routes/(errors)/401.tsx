import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { UnauthorisedError } from '@/features/errors/unauthorized-error'

export const Route = createFileRoute('/(errors)/401')({
  head: () =>
    buildSeo({
      title: '401 - 인증이 필요합니다 | Lotto Simulator',
      description: '로그인이 필요한 페이지입니다. 인증 후 다시 시도해 주세요.',
      path: '/401',
      noIndex: true,
    }),
  component: UnauthorisedError,
})
