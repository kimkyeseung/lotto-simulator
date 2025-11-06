import { Outlet, createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'

export const Route = createFileRoute('/template')({
  head: () =>
    buildSeo({
      title: '레이아웃 템플릿 | Lotto Simulator',
      description: '앱 사이드바와 레이아웃 구성을 테스트하기 위한 템플릿 페이지입니다.',
      path: '/template',
      noIndex: true,
    }),
  component: RouteComponent,
})

function RouteComponent() {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-[[data-layout=fixed]]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            <Outlet />
            {import.meta.env.MODE === 'development' && (
              <>
                <ReactQueryDevtools buttonPosition='bottom-left' />
                <TanStackRouterDevtools position='bottom-right' />
              </>
            )}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
