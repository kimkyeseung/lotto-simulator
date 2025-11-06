import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { SettingsAppearance } from '@/features/settings/appearance'

export const Route = createFileRoute('/_authenticated/settings/appearance')({
  head: () =>
    buildSeo({
      title: '테마 & 레이아웃 설정 | Lotto Simulator',
      description: '밝은 모드, 어두운 모드, 레이아웃 옵션을 선택해 대시보드를 최적화하세요.',
      path: '/_authenticated/settings/appearance',
      keywords: ['로또 테마 설정', '로또 레이아웃'],
      noIndex: true,
    }),
  component: SettingsAppearance,
})
