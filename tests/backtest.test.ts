import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'

import { getTicketPrice, runBacktest, type Draw } from '../src/lib/backtest.js'

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
