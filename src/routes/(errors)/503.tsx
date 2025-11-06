import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { MaintenanceError } from '@/features/errors/maintenance-error'

export const Route = createFileRoute('/(errors)/503')({
  head: () =>
    buildSeo({
      title: '503 - 점검 중 | Lotto Simulator',
      description: '현재 서비스 점검 중입니다. 점검이 완료되는 대로 다시 이용해 주세요.',
      path: '/503',
      noIndex: true,
    }),
  component: MaintenanceError,
})
