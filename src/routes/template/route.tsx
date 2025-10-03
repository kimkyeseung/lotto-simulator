import { Outlet, createFileRoute } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { NavigationProgress } from '@/components/navigation-progress'

export const Route = createFileRoute('/template')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <NavigationProgress />
      <Outlet />
      {import.meta.env.MODE === 'development' && (
        <>
          <ReactQueryDevtools buttonPosition='bottom-left' />
          <TanStackRouterDevtools position='bottom-right' />
        </>
      )}
    </>
  )
}
