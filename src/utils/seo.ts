const BASE_URL =
  import.meta.env.VITE_APP_URL ?? 'https://lotto-simulator-three.vercel.app/'
const DEFAULT_IMAGE_PATH = '/images/lotto-logo.svg'

type SeoInput = {
  title: string
  description: string
  path?: string
  image?: string
  keywords?: string[]
  noIndex?: boolean
}

type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }

type LinkTag = { rel: string; href: string }

const toAbsoluteUrl = (path?: string) => {
  if (!path) return BASE_URL

  try {
    return new URL(path, BASE_URL).toString()
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('Invalid SEO path provided:', path, error)
    }
    return BASE_URL
  }
}

export const buildSeo = ({
  title,
  description,
  path,
  image,
  keywords,
  noIndex,
}: SeoInput) => {
  const canonicalUrl = toAbsoluteUrl(path)
  const imageUrl = image
    ? toAbsoluteUrl(image)
    : toAbsoluteUrl(DEFAULT_IMAGE_PATH)

  const meta = (
    [
      { title },
      { name: 'description', content: description },
      keywords?.length
        ? { name: 'keywords', content: keywords.join(', ') }
        : undefined,
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: imageUrl },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
      noIndex ? { name: 'robots', content: 'noindex, nofollow' } : undefined,
    ] as Array<MetaTag | undefined>
  ).filter(Boolean) as MetaTag[]

  const links: LinkTag[] = [{ rel: 'canonical', href: canonicalUrl }]

  return {
    meta,
    links,
  }
}

export const defaultSeo = buildSeo({
  title: 'Lotto Simulator | 로또 자동 구매 & 실시간 통계 분석',
  description:
    '로또 번호 시뮬레이션부터 자동 구매, 당첨 통계 분석까지 한 번에 확인할 수 있는 Lotto Simulator 플랫폼입니다.',
  path: '/',
  keywords: ['로또 시뮬레이터', '로또 자동구매', '로또 통계', '로또 번호 분석'],
})
