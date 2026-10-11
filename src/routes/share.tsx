import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { SharedResult } from '@/features/share'

export const Route = createFileRoute('/share')({
  head: () =>
    buildSeo({
      title: '공유된 로또 시뮬레이션 결과 | Lotto Simulator',
      description:
        '친구가 공유한 로또 시뮬레이션 결과를 확인하고 직접 시뮬레이션해 보세요.',
      path: '/share',
      noIndex: true,
    }),
  component: SharedResult,
})
