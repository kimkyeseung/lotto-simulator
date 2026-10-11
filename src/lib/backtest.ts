import type { WinningRank } from '../types/lotto'
// node --test로 컴파일된 결과를 직접 실행하므로 .js 확장자를 명시 (Vite는 .ts로 해석)
import { checkLottoResult, normalizeAndCompleteLottoNumbers } from './lotto.js'

/** 실제 추첨 회차 (public/data/draws.json) */
export type Draw = {
  no: number
  /** YYYY-MM-DD */
  date: string
  numbers: number[]
  bonus: number
  /** 1~5등 1게임당 당첨금 (원). 해당 등수 당첨자가 없던 회차는 0 */
  prizes: number[]
}

export type DrawsFile = {
  latest: number
  draws: Draw[]
}

export type BacktestBest = {
  rank: Exclude<WinningRank, 0>
  drawNo: number
  date: string
  ticket: number[]
  matchedNumbers: number[]
}

export type BacktestTimelinePoint = {
  no: number
  date: string
  netProfit: number
}

export type BacktestResult = {
  drawCount: number
  gameCount: number
  spent: number
  prize: number
  netProfit: number
  profitRate: number
  rankCounts: Record<WinningRank, number>
  best: BacktestBest | null
  timeline: BacktestTimelinePoint[]
}

/** 2004-08-01부터 1게임 가격이 2,000원에서 1,000원으로 인하됨 */
const PRICE_CUT_DATE = '2004-08-01'
const MAX_TIMELINE_POINTS = 400

export function getTicketPrice(date: string): number {
  return date < PRICE_CUT_DATE ? 2000 : 1000
}

/**
 * 역대 회차에 같은 번호로 매주 구매했다고 가정하고 결과를 계산한다.
 * - 번호가 6개인 티켓은 매 회차 같은 번호로 구매
 * - 6개 미만인 티켓은 매 회차 나머지를 자동으로 채워 구매 (실제 반자동/자동과 동일)
 * - 당첨자가 없어 당첨금이 0인 등수는 fallbackPrizes로 대신 계산
 */
export function runBacktest(
  tickets: number[][],
  draws: Draw[],
  fallbackPrizes: Record<WinningRank, number>
): BacktestResult {
  const rankCounts: Record<WinningRank, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  }
  const timeline: BacktestTimelinePoint[] = []
  const sampleStep = Math.max(1, Math.ceil(draws.length / MAX_TIMELINE_POINTS))

  let spent = 0
  let prize = 0
  let best: BacktestBest | null = null

  draws.forEach((draw, index) => {
    const winningNumbers = [...draw.numbers, draw.bonus]
    const price = getTicketPrice(draw.date)

    for (const ticket of tickets) {
      const numbers =
        ticket.length === 6 ? ticket : normalizeAndCompleteLottoNumbers(ticket)
      const result = checkLottoResult(numbers, winningNumbers)

      spent += price
      rankCounts[result.rank] += 1

      if (result.rank === 0) continue

      prize += draw.prizes[result.rank - 1] || fallbackPrizes[result.rank]
      if (!best || result.rank < best.rank) {
        best = {
          rank: result.rank,
          drawNo: draw.no,
          date: draw.date,
          ticket: numbers,
          matchedNumbers: result.matchedNumbers,
        }
      }
    }

    if (index % sampleStep === 0 || index === draws.length - 1) {
      timeline.push({ no: draw.no, date: draw.date, netProfit: prize - spent })
    }
  })

  return {
    drawCount: draws.length,
    gameCount: draws.length * tickets.length,
    spent,
    prize,
    netProfit: prize - spent,
    profitRate: spent === 0 ? 0 : ((prize - spent) / spent) * 100,
    rankCounts,
    best,
    timeline,
  }
}
