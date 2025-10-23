import { useEffect } from 'react'

import { cn } from '@/lib/utils'

declare global {
  interface Window {
    kakaoAsyncLoad?: () => void
  }
}

interface KakaoAdProps {
  unitId: string
  width: number | string
  height: number | string
  className?: string
}

const KAKAO_SCRIPT_ID = 'kakao-ad-script'
const KAKAO_SCRIPT_SRC = 'https://t1.daumcdn.net/kas/static/ba.min.js'

export function KakaoAd({
  unitId,
  width,
  height,
  className,
}: KakaoAdProps) {
  useEffect(() => {
    const existingScript = document.getElementById(
      KAKAO_SCRIPT_ID
    ) as HTMLScriptElement | null

    if (!existingScript) {
      const script = document.createElement('script')
      script.id = KAKAO_SCRIPT_ID
      script.src = KAKAO_SCRIPT_SRC
      script.async = true
      script.type = 'text/javascript'
      script.charset = 'utf-8'

      script.onload = () => {
        window.kakaoAsyncLoad?.()
      }

      document.body.appendChild(script)
    } else {
      window.kakaoAsyncLoad?.()
    }
  }, [])

  return (
    <ins
      className={cn('kakao_ad_area', className)}
      style={{ display: 'none', width: '100%' }}
      data-ad-unit={unitId}
      data-ad-width={width}
      data-ad-height={height}
    />
  )
}

