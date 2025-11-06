import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { ComingSoon } from '@/components/coming-soon'

export const Route = createFileRoute('/_authenticated/help-center/')({
  head: () =>
    buildSeo({
      title: '헬프 센터 | Lotto Simulator',
      description: 'Lotto Simulator 사용 방법과 자주 묻는 질문을 준비 중입니다.',
      path: '/_authenticated/help-center/',
      keywords: ['로또 도움말', '로또 시뮬레이터 가이드'],
      noIndex: true,
    }),
  component: ComingSoon,
})
