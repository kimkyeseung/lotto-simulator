import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { Dashboard } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  head: () =>
    buildSeo({
      title: '로또 시뮬레이터 대시보드 | Lotto Simulator',
      description:
        '실시간 당첨 통계, 수익률, 번호 히트맵으로 로또 전략을 분석할 수 있는 대시보드입니다.',
      path: '/_authenticated/',
      keywords: ['로또 시뮬레이터 대시보드', '로또 통계', '로또 수익률'],
    }),
  component: Dashboard,
})
