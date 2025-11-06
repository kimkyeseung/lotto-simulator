import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { GeneralError } from '@/features/errors/general-error'

export const Route = createFileRoute('/(errors)/500')({
  head: () =>
    buildSeo({
      title: '500 - 서버 오류 | Lotto Simulator',
      description: '일시적인 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      path: '/500',
      noIndex: true,
    }),
  component: GeneralError,
})
