import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { Tasks } from '@/features/tasks'
import { priorities, statuses } from '@/features/tasks/data/data'

const taskSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  priority: z
    .array(z.enum(priorities.map((priority) => priority.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/tasks/')({
  head: () =>
    buildSeo({
      title: '로또 작업 관리 | Lotto Simulator',
      description: '티켓 제출과 당첨 확인 작업을 한곳에서 관리하고 상태를 추적하세요.',
      path: '/_authenticated/tasks/',
      keywords: ['로또 작업 관리', '로또 업무 현황'],
      noIndex: true,
    }),
  validateSearch: taskSearchSchema,
  component: Tasks,
})
