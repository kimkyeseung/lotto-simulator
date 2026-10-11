import { getProfitRate, getShareTitle, type SharePayload } from './share'

const SIZE = 1080
const PADDING = 88
const COLORS = {
  background: '#0b1020',
  panel: '#151c33',
  text: '#f8fafc',
  muted: '#94a3b8',
  profit: '#10b981',
  loss: '#f43f5e',
}

/** 결과 요약을 정사각형 PNG 카드로 그린다 (SNS/메신저 공유용) */
export async function renderShareImage(payload: SharePayload): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas를 사용할 수 없습니다.')

  await document.fonts?.ready
  const fontFamily = getComputedStyle(document.body).fontFamily || 'sans-serif'
  const font = (weight: number, size: number) =>
    `${weight} ${size}px ${fontFamily}`

  const net = payload.prize - payload.spent
  const sign = net >= 0 ? '+' : ''
  const accent = net >= 0 ? COLORS.profit : COLORS.loss

  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = COLORS.muted
  ctx.font = font(700, 30)
  ctx.fillText('LOTTO SIMULATOR', PADDING, 150)

  ctx.fillStyle = COLORS.text
  ctx.font = font(700, 56)
  ctx.fillText(getShareTitle(payload), PADDING, 230, SIZE - PADDING * 2)

  ctx.fillStyle = COLORS.muted
  ctx.font = font(500, 34)
  ctx.fillText('순손익', PADDING, 360)

  ctx.fillStyle = accent
  ctx.font = font(800, 104)
  ctx.fillText(
    `${sign}${net.toLocaleString()}원`,
    PADDING,
    470,
    SIZE - PADDING * 2
  )

  ctx.font = font(700, 48)
  ctx.fillText(
    `수익률 ${sign}${getProfitRate(payload).toFixed(1)}%`,
    PADDING,
    550
  )

  ctx.fillStyle = COLORS.muted
  ctx.font = font(500, 32)
  ctx.fillText(
    `${payload.games.toLocaleString()}게임 · 구매 ${payload.spent.toLocaleString()}원 · 당첨 ${payload.prize.toLocaleString()}원`,
    PADDING,
    620,
    SIZE - PADDING * 2
  )

  const gap = 20
  const boxWidth = (SIZE - PADDING * 2 - gap * 4) / 5
  const boxTop = 690
  const boxHeight = 170
  payload.ranks.forEach((rankCount, index) => {
    const x = PADDING + index * (boxWidth + gap)
    ctx.fillStyle = COLORS.panel
    ctx.beginPath()
    ctx.roundRect(x, boxTop, boxWidth, boxHeight, 20)
    ctx.fill()

    ctx.textAlign = 'center'
    ctx.fillStyle = COLORS.muted
    ctx.font = font(600, 30)
    ctx.fillText(`${index + 1}등`, x + boxWidth / 2, boxTop + 60)

    ctx.fillStyle = rankCount > 0 && index < 3 ? accent : COLORS.text
    ctx.font = font(800, 44)
    ctx.fillText(
      rankCount.toLocaleString(),
      x + boxWidth / 2,
      boxTop + 130,
      boxWidth - 16
    )
    ctx.textAlign = 'left'
  })

  ctx.fillStyle = COLORS.muted
  ctx.font = font(500, 28)
  ctx.fillText(window.location.host, PADDING, SIZE - 80)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('이미지 생성에 실패했습니다.')),
      'image/png'
    )
  })
}
