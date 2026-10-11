import { z } from 'zod'

const amount = z.number().int().min(0).max(1e15)
const count = z.number().int().min(0).max(1e9)

/**
 * 공유 링크에 담기는 결과 요약
 * - URL 해시에 담기므로 누구나 조작할 수 있다. 디코딩 시 반드시 검증한다.
 */
const sharePayloadSchema = z
  .object({
    v: z.literal(1),
    kind: z.enum(['simulation', 'backtest']),
    /** simulation: 구매 회차 수, backtest: 추첨 회차 수 */
    rounds: count,
    games: count,
    spent: amount,
    prize: amount,
    /** 1~5등 당첨 횟수 */
    ranks: z.array(count).length(5),
    /** backtest 기간 (회차) */
    from: count.optional(),
    to: count.optional(),
  })
  .refine(
    (payload) =>
      payload.kind !== 'backtest' ||
      (payload.from !== undefined &&
        payload.to !== undefined &&
        payload.from <= payload.to),
    { message: '백테스트 결과에는 기간(from, to)이 필요합니다.' }
  )

export type SharePayload = z.infer<typeof sharePayloadSchema>

const toBase64Url = (text: string) =>
  btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const fromBase64Url = (text: string) =>
  atob(text.replace(/-/g, '+').replace(/_/g, '/'))

export function encodeSharePayload(payload: SharePayload): string {
  // 숫자와 영문 키만 담기므로 ASCII 범위 안에서 btoa 사용 가능
  return toBase64Url(JSON.stringify(sharePayloadSchema.parse(payload)))
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const result = sharePayloadSchema.safeParse(
      JSON.parse(fromBase64Url(encoded))
    )
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function buildShareUrl(payload: SharePayload): string {
  return `${window.location.origin}/share#${encodeSharePayload(payload)}`
}

export function getShareTitle(payload: SharePayload): string {
  return payload.kind === 'backtest'
    ? `로또 ${payload.from}~${payload.to}회 매주 샀다면?`
    : `로또 ${payload.rounds.toLocaleString()}회 시뮬레이션 결과`
}

export function getProfitRate(payload: SharePayload): number {
  return payload.spent === 0
    ? 0
    : ((payload.prize - payload.spent) / payload.spent) * 100
}

export function getShareText(payload: SharePayload): string {
  const net = payload.prize - payload.spent
  const sign = net >= 0 ? '+' : ''
  return [
    getShareTitle(payload),
    `${payload.spent.toLocaleString()}원 써서 ${payload.prize.toLocaleString()}원 당첨`,
    `순손익 ${sign}${net.toLocaleString()}원 (수익률 ${sign}${getProfitRate(payload).toFixed(1)}%)`,
  ].join('\n')
}
