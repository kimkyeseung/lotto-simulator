import { useEffect, useState } from 'react'
import { type QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { createPortal } from 'react-dom'
import { GoogleAnalytics } from '@/components/google-analytics'
import { StructuredData } from '@/components/structured-data'
import { defaultSeo } from '@/utils/seo'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'

function HeadManager() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const globalScope = window as typeof window & {
      __lottoSeoCleaned?: boolean
    }

    if (!globalScope.__lottoSeoCleaned) {
      const removableSelectors = [
        'title',
        "meta[name='description']",
        "meta[name='keywords']",
        "meta[name='robots']",
        "meta[name='title']",
        "meta[property^='og:']",
        "meta[name^='twitter:']",
        "link[rel='canonical']",
      ]

      removableSelectors.forEach((selector) => {
        document.head.querySelectorAll(selector).forEach((node) => {
          node.parentElement?.removeChild(node)
        })
      })

      globalScope.__lottoSeoCleaned = true
    }

    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return createPortal(<HeadContent />, document.head)
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [...defaultSeo.meta],
    links: defaultSeo.links ? [...defaultSeo.links] : undefined,
  }),
  component: () => {
    return (
      <>
        <HeadManager />
        <StructuredData />
        <GoogleAnalytics />
        <NavigationProgress />
        <Outlet />
        <Toaster duration={5000} expand />
        {import.meta.env.MODE === 'development' && (
          <>
            <ReactQueryDevtools buttonPosition='bottom-left' />
            <TanStackRouterDevtools position='bottom-right' />
          </>
        )}
      </>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
