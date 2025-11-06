import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { SettingsProfile } from '@/features/settings/profile'

export const Route = createFileRoute('/_authenticated/settings/')({
  head: () =>
    buildSeo({
      title: '프로필 설정 | Lotto Simulator',
      description: '프로필 정보를 업데이트하고 로또 시뮬레이션 알림을 맞춤 설정하세요.',
      path: '/_authenticated/settings/',
      keywords: ['로또 프로필 설정', '로또 알림 설정'],
      noIndex: true,
    }),
  component: SettingsProfile,
})
