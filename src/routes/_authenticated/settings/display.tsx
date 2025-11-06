import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { SettingsDisplay } from '@/features/settings/display'

export const Route = createFileRoute('/_authenticated/settings/display')({
  head: () =>
    buildSeo({
      title: '대시보드 표시 설정 | Lotto Simulator',
      description: '차트, 위젯, 알림 표시 방식을 커스터마이징해 나만의 로또 대시보드를 구성하세요.',
      path: '/_authenticated/settings/display',
      keywords: ['로또 대시보드 설정', '로또 위젯'],
      noIndex: true,
    }),
  component: SettingsDisplay,
})
