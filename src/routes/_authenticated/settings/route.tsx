import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { Settings } from '@/features/settings'

export const Route = createFileRoute('/_authenticated/settings')({
  head: () =>
    buildSeo({
      title: '환경 설정 | Lotto Simulator',
      description: '로또 시뮬레이션 환경과 계정 설정을 원하는 대로 구성하세요.',
      path: '/_authenticated/settings',
      keywords: ['로또 설정', '시뮬레이터 환경 설정'],
      noIndex: true,
    }),
  component: Settings,
})
