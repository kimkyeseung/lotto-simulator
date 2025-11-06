import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { NotFoundError } from '@/features/errors/not-found-error'

export const Route = createFileRoute('/(errors)/404')({
  head: () =>
    buildSeo({
      title: '404 - 페이지를 찾을 수 없습니다 | Lotto Simulator',
      description: '요청하신 페이지가 존재하지 않습니다. 홈으로 돌아가 Lotto Simulator 서비스를 이용하세요.',
      path: '/404',
      noIndex: true,
    }),
  component: NotFoundError,
})
