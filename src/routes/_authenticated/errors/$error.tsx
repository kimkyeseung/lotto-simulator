import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ForbiddenError } from '@/features/errors/forbidden'
import { GeneralError } from '@/features/errors/general-error'
import { MaintenanceError } from '@/features/errors/maintenance-error'
import { NotFoundError } from '@/features/errors/not-found-error'
import { UnauthorisedError } from '@/features/errors/unauthorized-error'

const errorSeoMap: Record<string, { title: string; description: string }> = {
  unauthorized: {
    title: '401 - 인증이 필요합니다 | Lotto Simulator',
    description: '로그인이 필요한 페이지입니다. 인증 후 다시 시도해 주세요.',
  },
  forbidden: {
    title: '403 - 접근이 제한되었습니다 | Lotto Simulator',
    description: '요청하신 페이지에 접근 권한이 없습니다. 필요한 권한을 확인하세요.',
  },
  'not-found': {
    title: '404 - 페이지를 찾을 수 없습니다 | Lotto Simulator',
    description: '요청하신 페이지가 존재하지 않습니다. 홈으로 이동해 Lotto Simulator를 이용하세요.',
  },
  'internal-server-error': {
    title: '500 - 서버 오류 | Lotto Simulator',
    description: '일시적인 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  },
  'maintenance-error': {
    title: '503 - 점검 중 | Lotto Simulator',
    description: '현재 서비스 점검 중입니다. 점검이 완료되면 다시 이용해 주세요.',
  },
}

export const Route = createFileRoute('/_authenticated/errors/$error')({
  head: ({ params }) => {
    const fallback = {
      title: '오류가 발생했습니다 | Lotto Simulator',
      description: '요청을 처리하는 중 문제가 발생했습니다. 계속해서 문제가 발생하면 관리자에게 문의하세요.',
    }

    const meta = errorSeoMap[params.error] ?? fallback

    return buildSeo({
      ...meta,
      path: `/_authenticated/errors/${params.error}`,
      noIndex: true,
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { error } = Route.useParams()

  const errorMap: Record<string, React.ComponentType> = {
    unauthorized: UnauthorisedError,
    forbidden: ForbiddenError,
    'not-found': NotFoundError,
    'internal-server-error': GeneralError,
    'maintenance-error': MaintenanceError,
  }
  const ErrorComponent = errorMap[error] || NotFoundError

  return (
    <>
      <Header fixed className='border-b'>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <div className='flex-1 [&>div]:h-full'>
        <ErrorComponent />
      </div>
    </>
  )
}
