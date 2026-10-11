import type { WinningRank } from '../types/lotto'
import { RANK_PROBABILITIES } from './lotto-odds.js'
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

type PrizeRank = Exclude<WinningRank, 0>
export type PrizeMap = Record<WinningRank, number>

export type BacktestBest = {
  rank: PrizeRank
  drawNo: number
  date: string
  ticket: number[]
  matchedNumbers: number[]
}

export type BacktestTimelinePoint = {
  no: number
  date: string
  /** 해당 회차까지 누적 구매액 */
  spent: number
  netProfit: number
}

/** 고정: 6개 직접 선택, 반자동: 일부 선택, 자동: 선택 없음 */
export type TicketKind = 'fixed' | 'semi' | 'auto'

export type TicketStats = {
  kind: TicketKind
  spent: number
  prize: number
  rankCounts: Record<WinningRank, number>
  /** 0이면 당첨 없음 */
  bestRank: WinningRank
}

export type YearStats = {
  year: number
  spent: number
  prize: number
}

/** 한 등수 차이로 더 큰 당첨금을 놓친 게임 (5개 일치) */
export type NearMiss = {
  drawNo: number
  date: string
  ticketIndex: number
  rank: 2 | 3
  prize: number
  /** 한 등수 위였다면 받았을 당첨금 */
  missedPrize: number
  ticket: number[]
  matchedNumbers: number[]
}

export type DrawStreak = {
  length: number
  fromNo: number
  toNo: number
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
  /** 확률상 기대 당첨금 (회차별 실제 당첨금 × 등수별 확률) */
  expectedPrize: number
  /** 1~5등별 기대 당첨금 (합계 = expectedPrize) */
  expectedRankPrizes: number[]
  /** 당첨번호 6개 중 맞힌 개수(0~6)별 게임 수 */
  matchCounts: number[]
  tickets: TicketStats[]
  years: YearStats[]
  firstWin: {
    drawNo: number
    date: string
    rank: PrizeRank
    drawsUntil: number
  } | null
  /** 어떤 용지도 당첨되지 않은 가장 긴 연속 회차 */
  longestDrought: DrawStreak | null
  /** 누적 손익 최고점 (0이면 한 번도 본전을 넘지 못함) */
  peakNetProfit: number
  /** 누적 손익 최고점 대비 최대 하락폭 */
  maxDrawdown: number
  /** missedPrize가 큰 순서로 최대 10개 */
  nearMisses: NearMiss[]
}

/** 2004-08-01부터 1게임 가격이 2,000원에서 1,000원으로 인하됨 */
const PRICE_CUT_DATE = '2004-08-01'
const MAX_TIMELINE_POINTS = 400
const MAX_NEAR_MISSES = 10
const PRIZE_RANKS: PrizeRank[] = [1, 2, 3, 4, 5]

export function getTicketPrice(date: string): number {
  return date < PRICE_CUT_DATE ? 2000 : 1000
}

/** 해당 회차 등수별 1게임 당첨금. 당첨자가 없던 등수는 기본 당첨금으로 대신 계산 */
export function getDrawPrize(
  draw: Draw,
  rank: PrizeRank,
  fallbackPrizes: PrizeMap
): number {
  return draw.prizes[rank - 1] || fallbackPrizes[rank]
}

export function getTicketKind(ticket: number[]): TicketKind {
  if (ticket.length === 6) return 'fixed'
  return ticket.length === 0 ? 'auto' : 'semi'
}

const createRankCounts = (): Record<WinningRank, number> => ({
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
})

/**
 * 역대 회차에 같은 번호로 매주 구매했다고 가정하고 결과를 계산한다.
 * - 번호가 6개인 티켓은 매 회차 같은 번호로 구매
 * - 6개 미만인 티켓은 매 회차 나머지를 자동으로 채워 구매 (실제 반자동/자동과 동일)
 * - 당첨자가 없어 당첨금이 0인 등수는 fallbackPrizes로 대신 계산
 */
export function runBacktest(
  tickets: number[][],
  draws: Draw[],
  fallbackPrizes: PrizeMap
): BacktestResult {
  const rankCounts = createRankCounts()
  const matchCounts = Array<number>(7).fill(0)
  const ticketStats: TicketStats[] = tickets.map((ticket) => ({
    kind: getTicketKind(ticket),
    spent: 0,
    prize: 0,
    rankCounts: createRankCounts(),
    bestRank: 0,
  }))
  const yearMap = new Map<number, YearStats>()
  const timeline: BacktestTimelinePoint[] = []
  const nearMisses: NearMiss[] = []
  const sampleStep = Math.max(1, Math.ceil(draws.length / MAX_TIMELINE_POINTS))
  const winProbability = PRIZE_RANKS.map((rank) => RANK_PROBABILITIES[rank])
  // 고정 번호는 선택한 순서대로 저장되어 있으므로 표시용으로 한 번 정렬해 둔다
  const fixedTickets = tickets.map((ticket) =>
    ticket.length === 6 ? [...ticket].sort((a, b) => a - b) : null
  )

  let spent = 0
  let prize = 0
  let expectedPrize = 0
  const expectedRankPrizes = Array<number>(5).fill(0)
  let best: BacktestBest | null = null
  let firstWin: BacktestResult['firstWin'] = null
  let longestDrought: DrawStreak | null = null
  let currentDroughtStart = -1
  let peakNetProfit = 0
  let maxDrawdown = 0

  draws.forEach((draw, drawIndex) => {
    const winningNumbers = [...draw.numbers, draw.bonus]
    const price = getTicketPrice(draw.date)
    const year = Number(draw.date.slice(0, 4))
    const yearStats = yearMap.get(year) ?? { year, spent: 0, prize: 0 }
    yearMap.set(year, yearStats)

    const expectedPerGame = PRIZE_RANKS.map(
      (rank, i) => winProbability[i] * getDrawPrize(draw, rank, fallbackPrizes)
    )
    let hasWinThisDraw = false

    tickets.forEach((ticket, ticketIndex) => {
      const numbers =
        fixedTickets[ticketIndex] ?? normalizeAndCompleteLottoNumbers(ticket)
      const result = checkLottoResult(numbers, winningNumbers)
      const mainMatchCount = result.matchedNumbers.filter(
        (n) => n !== draw.bonus
      ).length
      const stats = ticketStats[ticketIndex]

      spent += price
      stats.spent += price
      yearStats.spent += price
      expectedPerGame.forEach((value, i) => {
        expectedRankPrizes[i] += value
        expectedPrize += value
      })
      rankCounts[result.rank] += 1
      stats.rankCounts[result.rank] += 1
      matchCounts[mainMatchCount] += 1

      if (result.rank === 0) return

      const gamePrize = getDrawPrize(draw, result.rank, fallbackPrizes)
      hasWinThisDraw = true
      prize += gamePrize
      stats.prize += gamePrize
      yearStats.prize += gamePrize
      if (stats.bestRank === 0 || result.rank < stats.bestRank) {
        stats.bestRank = result.rank
      }

      if (!firstWin) {
        firstWin = {
          drawNo: draw.no,
          date: draw.date,
          rank: result.rank,
          drawsUntil: drawIndex + 1,
        }
      }
      if (!best || result.rank < best.rank) {
        best = {
          rank: result.rank,
          drawNo: draw.no,
          date: draw.date,
          ticket: numbers,
          matchedNumbers: result.matchedNumbers,
        }
      }
      if (result.rank === 2 || result.rank === 3) {
        nearMisses.push({
          drawNo: draw.no,
          date: draw.date,
          ticketIndex,
          rank: result.rank,
          prize: gamePrize,
          missedPrize: getDrawPrize(
            draw,
            (result.rank - 1) as PrizeRank,
            fallbackPrizes
          ),
          ticket: numbers,
          matchedNumbers: result.matchedNumbers,
        })
      }
    })

    // 연속 무당첨 구간 추적
    if (hasWinThisDraw) {
      currentDroughtStart = -1
    } else {
      if (currentDroughtStart === -1) currentDroughtStart = drawIndex
      const length = drawIndex - currentDroughtStart + 1
      if (!longestDrought || length > longestDrought.length) {
        longestDrought = {
          length,
          fromNo: draws[currentDroughtStart].no,
          toNo: draw.no,
        }
      }
    }

    const netProfit = prize - spent
    peakNetProfit = Math.max(peakNetProfit, netProfit)
    maxDrawdown = Math.max(maxDrawdown, peakNetProfit - netProfit)

    if (drawIndex % sampleStep === 0 || drawIndex === draws.length - 1) {
      timeline.push({ no: draw.no, date: draw.date, spent, netProfit })
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
    expectedPrize,
    expectedRankPrizes,
    matchCounts,
    tickets: ticketStats,
    years: [...yearMap.values()].sort((a, b) => a.year - b.year),
    firstWin,
    longestDrought,
    peakNetProfit,
    maxDrawdown,
    nearMisses: nearMisses
      .sort((a, b) => b.missedPrize - b.prize - (a.missedPrize - a.prize))
      .slice(0, MAX_NEAR_MISSES),
  }
}
