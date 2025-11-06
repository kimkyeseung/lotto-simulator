import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { SettingsNotifications } from '@/features/settings/notifications'

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  head: () =>
    buildSeo({
      title: '알림 설정 | Lotto Simulator',
      description: '당첨 결과, 시뮬레이션 업데이트 등 필요한 알림만 선택해 받아보세요.',
      path: '/_authenticated/settings/notifications',
      keywords: ['로또 알림 설정', '로또 알림 관리'],
      noIndex: true,
    }),
  component: SettingsNotifications,
})
