import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { Apps } from '@/features/apps'

const appsSearchSchema = z.object({
  type: z
    .enum(['all', 'connected', 'notConnected'])
    .optional()
    .catch(undefined),
  filter: z.string().optional().catch(''),
  sort: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/apps/')({
  head: () =>
    buildSeo({
      title: '연동 앱 관리 | Lotto Simulator',
      description: '로또 시뮬레이션에 필요한 외부 앱과 서비스를 연동하고 상태를 확인하세요.',
      path: '/_authenticated/apps/',
      keywords: ['로또 연동 서비스', '로또 앱 관리'],
      noIndex: true,
    }),
  validateSearch: appsSearchSchema,
  component: Apps,
})
