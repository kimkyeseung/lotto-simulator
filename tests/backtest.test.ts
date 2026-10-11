import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'

import { getTicketPrice, runBacktest, type Draw } from '../src/lib/backtest.js'
import {
  buildHistogram,
  countNumberAppearances,
  getPercentile,
  getSavingsBalance,
  simulateRandomPlayers,
} from '../src/lib/backtest-insights.js'
import {
  getMatchCountProbabilities,
  RANK_PROBABILITIES,
  TOTAL_COMBINATIONS,
} from '../src/lib/lotto-odds.js'

const FALLBACK_PRIZES = {
  0: 0,
  1: 2_000_000_000,
  2: 50_000_000,
  3: 1_500_000,
  4: 50_000,
  5: 5_000,
} as const

const draw = (no: number, date: string, prizes = [0, 0, 0, 50_000, 5_000]): Draw => ({
  no,
  date,
  numbers: [1, 2, 3, 4, 5, 6],
  bonus: 7,
  prizes,
})

describe('getTicketPrice', () => {
  it('charges 2,000 won before the 2004-08 price cut', () => {
    assert.equal(getTicketPrice('2004-07-31'), 2000)
    assert.equal(getTicketPrice('2004-08-01'), 1000)
    assert.equal(getTicketPrice('2026-10-10'), 1000)
  })
})

describe('runBacktest', () => {
  it('sums spending per game with the price of each draw date', () => {
    const draws = [draw(1, '2002-12-07'), draw(2, '2026-01-03')]
    const result = runBacktest([[40, 41, 42, 43, 44, 45]], draws, FALLBACK_PRIZES)

    assert.equal(result.drawCount, 2)
    assert.equal(result.gameCount, 2)
    assert.equal(result.spent, 3000)
    assert.equal(result.prize, 0)
    assert.equal(result.rankCounts[0], 2)
    assert.equal(result.best, null)
  })

  it('uses the actual prize of the draw', () => {
    const result = runBacktest(
      [[1, 2, 3, 40, 41, 42]],
      [draw(1, '2026-01-03')],
      FALLBACK_PRIZES
    )

    assert.equal(result.rankCounts[5], 1)
    assert.equal(result.prize, 5_000)
    assert.equal(result.netProfit, 4_000)
  })

  it('falls back to the configured prize when nobody won that rank', () => {
    const result = runBacktest(
      [[1, 2, 3, 4, 5, 6]],
      [draw(1, '2026-01-03', [0, 0, 0, 0, 0])],
      FALLBACK_PRIZES
    )

    assert.equal(result.rankCounts[1], 1)
    assert.equal(result.prize, FALLBACK_PRIZES[1])
  })

  it('records the best (lowest) rank with its first draw', () => {
    const result = runBacktest(
      [[1, 2, 3, 4, 40, 41]],
      [draw(10, '2026-01-03'), draw(11, '2026-01-10')],
      FALLBACK_PRIZES
    )

    assert.equal(result.best?.rank, 4)
    assert.equal(result.best?.drawNo, 10)
    assert.deepEqual(result.best?.matchedNumbers, [1, 2, 3, 4])
  })

  it('fills incomplete tickets with valid numbers every draw', () => {
    const draws = Array.from({ length: 50 }, (_, i) => draw(i + 1, '2026-01-03'))
    const result = runBacktest([[], [7]], draws, FALLBACK_PRIZES)

    assert.equal(result.gameCount, 100)
    const totalRanks = Object.values(result.rankCounts).reduce((a, b) => a + b, 0)
    assert.equal(totalRanks, 100)
  })

  it('keeps the timeline within the point limit and ends at the last draw', () => {
    const draws = Array.from({ length: 1245 }, (_, i) => draw(i + 1, '2026-01-03'))
    const result = runBacktest([[40, 41, 42, 43, 44, 45]], draws, FALLBACK_PRIZES)

    assert.ok(result.timeline.length <= 401)
    assert.equal(result.timeline[result.timeline.length - 1]?.no, 1245)
    assert.equal(result.timeline[result.timeline.length - 1]?.netProfit, -1_245_000)
  })
})

describe('runBacktest insights', () => {
  it('counts main-number matches separately from the bonus', () => {
    // 3개 일치 + 보너스(7) 포함 → 5등, 맞힌 개수는 3
    const result = runBacktest(
      [[1, 2, 3, 7, 40, 41]],
      [draw(1, '2026-01-03')],
      FALLBACK_PRIZES
    )
    assert.equal(result.rankCounts[5], 1)
    assert.equal(result.matchCounts[3], 1)
    assert.equal(result.matchCounts.reduce((a, b) => a + b, 0), 1)
  })

  it('computes expected prize from rank probabilities and actual prizes', () => {
    const prizes = [1_000_000_000, 50_000_000, 1_500_000, 50_000, 5_000]
    const result = runBacktest(
      [[40, 41, 42, 43, 44, 45]],
      [draw(1, '2026-01-03', prizes)],
      FALLBACK_PRIZES
    )
    const expected = [1, 2, 3, 4, 5].reduce(
      (sum, rank) =>
        sum +
        RANK_PROBABILITIES[rank as 1 | 2 | 3 | 4 | 5] * prizes[rank - 1],
      0
    )
    assert.ok(Math.abs(result.expectedPrize - expected) < 1e-9)
    assert.ok(
      Math.abs(result.expectedRankPrizes[0] - prizes[0] / TOTAL_COMBINATIONS) < 1e-9
    )
  })

  it('tracks first win, longest drought, peak and drawdown', () => {
    const lose = (no: number) => ({ ...draw(no, '2026-01-03'), numbers: [20, 21, 22, 23, 24, 25], bonus: 26 })
    // 회차 1~3 꽝, 4회 5등(+5,000 / -1,000), 5~6 꽝
    const draws = [lose(1), lose(2), lose(3), draw(4, '2026-01-24'), lose(5), lose(6)]
    const result = runBacktest([[1, 2, 3, 40, 41, 42]], draws, FALLBACK_PRIZES)

    assert.deepEqual(result.firstWin, {
      drawNo: 4,
      date: '2026-01-24',
      rank: 5,
      drawsUntil: 4,
    })
    assert.deepEqual(result.longestDrought, { length: 3, fromNo: 1, toNo: 3 })
    // 누적: -1000, -2000, -3000, +1000, 0, -1000
    assert.equal(result.peakNetProfit, 1000)
    assert.equal(result.maxDrawdown, 3000)
  })

  it('groups spending and prizes by year and by ticket', () => {
    const draws = [draw(1, '2025-12-27'), draw(2, '2026-01-03')]
    const result = runBacktest(
      [[1, 2, 3, 40, 41, 42], [40, 41, 42, 43, 44, 45]],
      draws,
      FALLBACK_PRIZES
    )

    assert.deepEqual(result.years, [
      { year: 2025, spent: 2000, prize: 5000 },
      { year: 2026, spent: 2000, prize: 5000 },
    ])
    assert.equal(result.tickets[0].kind, 'fixed')
    assert.equal(result.tickets[0].prize, 10_000)
    assert.equal(result.tickets[0].bestRank, 5)
    assert.equal(result.tickets[1].prize, 0)
    assert.equal(result.tickets[1].bestRank, 0)
  })

  it('records 5-match near misses with the prize one rank up', () => {
    const prizes = [2_000_000_000, 60_000_000, 1_500_000, 50_000, 5_000]
    const result = runBacktest(
      [[1, 2, 3, 4, 5, 40]],
      [draw(1, '2026-01-03', prizes)],
      FALLBACK_PRIZES
    )

    assert.equal(result.nearMisses.length, 1)
    assert.equal(result.nearMisses[0].rank, 3)
    assert.equal(result.nearMisses[0].prize, 1_500_000)
    assert.equal(result.nearMisses[0].missedPrize, 60_000_000)
  })
})

describe('lotto odds', () => {
  it('has the official rank probabilities', () => {
    assert.equal(TOTAL_COMBINATIONS, 8_145_060)
    assert.equal(Math.round(1 / RANK_PROBABILITIES[3]), 35_724)
    assert.equal(Math.round(1 / RANK_PROBABILITIES[4]), 733)
    assert.equal(Math.round(1 / RANK_PROBABILITIES[5]), 45)
  })

  it('match-count probabilities sum to 1', () => {
    const sum = getMatchCountProbabilities().reduce((a, b) => a + b, 0)
    assert.ok(Math.abs(sum - 1) < 1e-12)
  })
})

describe('backtest insights', () => {
  it('counts number appearances', () => {
    const { main, bonus } = countNumberAppearances([draw(1, '2026-01-03'), draw(2, '2026-01-10')])
    assert.equal(main[1], 2)
    assert.equal(main[45], 0)
    assert.equal(bonus[7], 2)
  })

  it('accumulates weekly savings with compound interest', () => {
    const draws = [draw(1, '2026-01-03'), draw(2, '2026-01-10')]
    assert.equal(getSavingsBalance(draws, 5, 0), 10_000)
    assert.ok(Math.abs(getSavingsBalance(draws, 1, 0.52) - (1000 * 1.01 + 1000)) < 1e-9)
  })

  it('computes percentiles with ties counted as half', () => {
    assert.equal(getPercentile([1, 2, 3, 4], 5), 100)
    assert.equal(getPercentile([1, 2, 3, 4], 0), 0)
    assert.equal(getPercentile([1, 2, 3, 4], 3), 62.5)
  })

  it('builds a histogram that keeps every value', () => {
    const { bins, below, above } = buildHistogram([0, 1, 2, 3, 10], 5)
    assert.equal(bins.length, 5)
    assert.equal(bins.reduce((sum, bin) => sum + bin.count, 0), 5)
    assert.equal(bins[4].count, 1)
    assert.equal(below + above, 0)
  })

  it('leaves extreme values out of the histogram range', () => {
    const values = [...Array.from({ length: 99 }, (_, i) => i), 1_000_000]
    const { bins, above } = buildHistogram(values, 10, { upperQ: 0.99 })
    assert.equal(above, 1)
    assert.ok(bins[bins.length - 1].to < 1_000_000)
    assert.equal(bins.reduce((sum, bin) => sum + bin.count, 0), 99)
  })

  it('simulates random players with deterministic randomness', () => {
    let seed = 42
    const random = () => {
      seed = (seed * 1_103_515_245 + 12_345) % 2 ** 31
      return seed / 2 ** 31
    }
    const draws = Array.from({ length: 20 }, (_, i) => draw(i + 1, '2026-01-03'))
    const results = simulateRandomPlayers(draws, 5, 50, FALLBACK_PRIZES, random)

    assert.equal(results.length, 50)
    for (const net of results) {
      // 최소 손익은 전부 꽝(-100,000), 당첨금은 5,000 단위 이상
      assert.ok(net >= -100_000)
      assert.equal((net + 100_000) % 5_000, 0)
    }
  })
})
