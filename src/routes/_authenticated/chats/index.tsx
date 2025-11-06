import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { Chats } from '@/features/chats'

export const Route = createFileRoute('/_authenticated/chats/')({
  head: () =>
    buildSeo({
      title: '팀 채팅 | Lotto Simulator',
      description: '로또 시뮬레이션 팀과 실시간으로 소통하며 전략을 논의하세요.',
      path: '/_authenticated/chats/',
      keywords: ['로또 협업', '로또 채팅'],
      noIndex: true,
    }),
  component: Chats,
})
