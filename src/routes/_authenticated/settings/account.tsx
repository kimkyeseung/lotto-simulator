import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { SettingsAccount } from '@/features/settings/account'

export const Route = createFileRoute('/_authenticated/settings/account')({
  head: () =>
    buildSeo({
      title: '계정 보안 설정 | Lotto Simulator',
      description: '비밀번호와 인증 옵션을 관리해 Lotto Simulator 계정을 안전하게 보호하세요.',
      path: '/_authenticated/settings/account',
      keywords: ['로또 계정 보안', '로또 계정 설정'],
      noIndex: true,
    }),
  component: SettingsAccount,
})
