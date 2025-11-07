import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

declare global {
  interface Window {
    dataLayer: Array<unknown>
    gtag?: (...args: Array<unknown>) => void
    __lottoGaInitialized?: boolean
  }
}

export function GoogleAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
  const location = useRouterState({
    select: (state) => state.location.href,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!measurementId) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('[GA4] VITE_GA_MEASUREMENT_ID is not defined.')
      }
      return
    }
    if (window.__lottoGaInitialized) return

    window.__lottoGaInitialized = true
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)

    script.onload = () => {
      window.dataLayer = window.dataLayer || []
      window.gtag =
        window.gtag ||
        function gtag(...args: unknown[]) {
          window.dataLayer.push(args)
        }

      window.gtag('js', new Date())
      window.gtag('config', measurementId, { send_page_view: false })
    }
  }, [measurementId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!measurementId) return
    if (!window.__lottoGaInitialized) return

    window.gtag?.('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.search,
    })
  }, [location, measurementId])

  return null
}
