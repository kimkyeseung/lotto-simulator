import { useIsMobile } from '@/hooks/use-mobile'
import { KakaoAd } from '@/components/kakao-ad'

const DEFAULT_WIDTH = 320
const DEFAULT_HEIGHT = 100

export function MobileKakaoAd() {
  const isMobile = useIsMobile()
  const unitId = import.meta.env.VITE_KAKAO_AD_UNIT_FOR_MOBILE
  const width =
    Number(import.meta.env.VITE_KAKAO_MOBILE_AD_WIDTH) || DEFAULT_WIDTH
  const height =
    Number(import.meta.env.VITE_KAKAO_MOBILE_AD_HEIGHT) || DEFAULT_HEIGHT

  if (!isMobile) {
    return null
  }

  return (
    <div className='pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center'>
      <div
        className='pointer-events-auto max-w-full'
        style={{ minWidth: `${width}px`, width: '100%' }}
      >
        <KakaoAd unitId={unitId} width={width} height={height} />
      </div>
    </div>
  )
}
