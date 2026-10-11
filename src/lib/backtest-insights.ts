import type { WinningRank } from '../types/lotto'
import {
  type Draw,
  getDrawPrize,
  getTicketPrice,
  type PrizeMap,
} from './backtest.js'

/** 번호(1~45)별 당첨번호/보너스 출현 횟수. 인덱스 = 번호 */
export function countNumberAppearances(draws: Draw[]) {
  const main = Array<number>(46).fill(0)
  const bonus = Array<number>(46).fill(0)
  for (const draw of draws) {
    for (const n of draw.numbers) main[n] += 1
    bonus[draw.bonus] += 1
  }
  return { main, bonus }
}

/**
 * 로또 대신 같은 금액을 매주 적금에 넣었을 때의 잔액 (세전, 주 단위 복리 가정)
 */
export function getSavingsBalance(
  draws: Draw[],
  gamesPerDraw: number,
  annualRate: number
): number {
  const weeklyRate = annualRate / 52
  return draws.reduce(
    (balance, draw) =>
      balance * (1 + weeklyRate) + getTicketPrice(draw.date) * gamesPerDraw,
    0
  )
}

/** values 중 target보다 작은 값의 비율 (0~100). 높을수록 상위 */
export function getPercentile(values: ArrayLike<number>, target: number) {
  if (values.length === 0) return 0
  let below = 0
  let equal = 0
  for (let i = 0; i < values.length; i++) {
    if (values[i] < target) below += 1
    else if (values[i] === target) equal += 1
  }
  return ((below + equal / 2) / values.length) * 100
}

export type HistogramBin = { from: number; to: number; count: number }

export type Histogram = {
  bins: HistogramBin[]
  /** 범위 아래/위로 벗어나 그래프에서 생략된 값의 수 */
  below: number
  above: number
}

/** 정렬된 배열에서 q(0~1) 분위수 */
function quantile(sorted: Float64Array, q: number) {
  return sorted[Math.floor(q * (sorted.length - 1))]
}

/**
 * 히스토그램을 만든다. 1등 당첨 같은 극단값이 축을 늘리지 않도록
 * [lowerQ, upperQ] 분위수 범위만 그리고 나머지는 below/above로 센다.
 */
export function buildHistogram(
  values: ArrayLike<number>,
  binCount: number,
  { lowerQ = 0, upperQ = 1 }: { lowerQ?: number; upperQ?: number } = {}
): Histogram {
  if (values.length === 0) return { bins: [], below: 0, above: 0 }
  const sorted = Float64Array.from(values).sort()
  const min = quantile(sorted, lowerQ)
  const max = upperQ >= 1 ? sorted[sorted.length - 1] : quantile(sorted, upperQ)
  const width = max === min ? 1 : (max - min) / binCount
  const bins = Array.from({ length: binCount }, (_, i) => ({
    from: min + width * i,
    to: min + width * (i + 1),
    count: 0,
  }))
  let below = 0
  let above = 0
  for (const value of sorted) {
    if (value < min) below += 1
    else if (value > max) above += 1
    else
      bins[Math.min(binCount - 1, Math.floor((value - min) / width))].count += 1
  }
  return { bins, below, above }
}

/**
 * 같은 기간, 같은 게임 수를 매주 자동으로 산 가상 플레이어들의 순손익
 * - 결과 분포와 비교해 사용자의 운이 좋았는지 판단하는 데 사용
 * - 6M+ 게임을 계산하므로 Web Worker에서 실행
 */
export function simulateRandomPlayers(
  draws: Draw[],
  gamesPerDraw: number,
  playerCount: number,
  fallbackPrizes: PrizeMap,
  random: () => number = Math.random
): Float64Array {
  // 회차별 번호 표시: 1 = 당첨번호, 2 = 보너스
  const marks = draws.map((draw) => {
    const mark = new Uint8Array(46)
    for (const n of draw.numbers) mark[n] = 1
    mark[draw.bonus] = 2
    return mark
  })
  const prizes = draws.map((draw) =>
    ([1, 2, 3, 4, 5] as Exclude<WinningRank, 0>[]).map((rank) =>
      getDrawPrize(draw, rank, fallbackPrizes)
    )
  )
  const totalSpent = draws.reduce(
    (sum, draw) => sum + getTicketPrice(draw.date) * gamesPerDraw,
    0
  )

  const pool = new Uint8Array(45).map((_, i) => i + 1)
  const results = new Float64Array(playerCount)

  for (let player = 0; player < playerCount; player++) {
    let prize = 0
    for (let d = 0; d < draws.length; d++) {
      const mark = marks[d]
      for (let g = 0; g < gamesPerDraw; g++) {
        let main = 0
        let hasBonus = false
        // 부분 Fisher-Yates: 앞 6개만 섞어 무작위 6개 선택
        for (let i = 0; i < 6; i++) {
          const j = i + Math.floor(random() * (45 - i))
          const picked = pool[j]
          pool[j] = pool[i]
          pool[i] = picked
          if (mark[picked] === 1) main += 1
          else if (mark[picked] === 2) hasBonus = true
        }
        if (main === 6) prize += prizes[d][0]
        else if (main === 5) prize += hasBonus ? prizes[d][1] : prizes[d][2]
        else if (main === 4) prize += prizes[d][3]
        else if (main === 3) prize += prizes[d][4]
      }
    }
    results[player] = prize - totalSpent
  }
  return results
}
