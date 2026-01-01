import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { SettingsComments } from '@/features/comments'

export const Route = createFileRoute('/_authenticated/settings/comments')({
  head: () =>
    buildSeo({
      title: '댓글 | Lotto Simulator',
      description: '커뮤니티 댓글을 확인하고 다른 사용자들과 소통하세요.',
      path: '/_authenticated/settings/comments',
      keywords: ['로또 커뮤니티', '로또 댓글', '로또 시뮬레이터'],
      noIndex: true,
    }),
  component: SettingsComments,
})
