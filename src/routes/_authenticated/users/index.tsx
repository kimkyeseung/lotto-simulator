import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { Users } from '@/features/users'
import { roles } from '@/features/users/data/data'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('invited'),
        z.literal('suspended'),
      ])
    )
    .optional()
    .catch([]),
  role: z
    .array(z.enum(roles.map((r) => r.value as (typeof roles)[number]['value'])))
    .optional()
    .catch([]),
  // Per-column text filter (example for username)
  username: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/users/')({
  head: () =>
    buildSeo({
      title: '사용자 관리 | Lotto Simulator',
      description: '시뮬레이터 사용자 역할과 활동 상태를 관리하고 초대 현황을 확인하세요.',
      path: '/_authenticated/users/',
      keywords: ['로또 사용자 관리', '시뮬레이터 사용자'],
      noIndex: true,
    }),
  validateSearch: usersSearchSchema,
  component: Users,
})
