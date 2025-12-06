import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { KakaoAd } from '@/components/kakao-ad'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const kakaoAdUnit = import.meta.env.VITE_KAKAO_AD_UNIT_2

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <div className='flex w-full'>
            <SidebarInset
              className={cn(
                // Set content container, so we can use container queries
                '@container/content',
                'flex-1',

                // If layout is fixed, set the height
                // to 100svh to prevent overflow
                'has-[[data-layout=fixed]]:h-svh',

                // If layout is fixed and sidebar is inset,
                // set the height to 100svh - spacing (total margins) to prevent overflow
                'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]'
              )}
            >
              {children ?? <Outlet />}
            </SidebarInset>

            {/* 데스크톱에서만 사이드 광고 표시 */}
            <aside className='hidden xl:block w-[320px] border-l p-4 overflow-y-auto h-svh sticky top-0'>
              {kakaoAdUnit ? (
                <div className='space-y-4'>
                  <KakaoAd unitId={kakaoAdUnit} width={300} height={250} />
                </div>
              ) : (
                <div className='text-muted-foreground text-sm text-center p-4'>
                  광고 영역
                </div>
              )}
            </aside>
          </div>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
