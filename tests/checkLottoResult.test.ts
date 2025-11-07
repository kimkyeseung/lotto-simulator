import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'

import { checkLottoResult } from '../src/lib/lotto.js'

const WINNING_NUMBERS = [1, 2, 3, 4, 5, 6, 7]

describe('checkLottoResult', () => {
  it('throws when the input length is invalid', () => {
    assert.throws(() => checkLottoResult([1, 2], WINNING_NUMBERS), /Invalid input/)
    assert.throws(
      () => checkLottoResult([1, 2, 3, 4, 5, 6], [1, 2, 3]),
      /Invalid input/
    )
  })

  it('returns 1st rank when all main numbers match', () => {
    const result = checkLottoResult([1, 2, 3, 4, 5, 6], WINNING_NUMBERS)
    assert.equal(result.rank, 1)
    assert.deepEqual(result.matchedNumbers.sort(), [1, 2, 3, 4, 5, 6])
  })

  it('returns 2nd rank when 5 numbers plus bonus match', () => {
    const result = checkLottoResult([1, 2, 3, 4, 5, 7], WINNING_NUMBERS)
    assert.equal(result.rank, 2)
    assert.ok(result.matchedNumbers.includes(7))
  })

  it('returns 3rd rank when exactly 5 numbers match without bonus', () => {
    const result = checkLottoResult([1, 2, 3, 4, 5, 45], WINNING_NUMBERS)
    assert.equal(result.rank, 3)
  })

  it('returns 4th rank with 4 matches and 5th rank with 3 matches', () => {
    assert.equal(checkLottoResult([1, 2, 3, 4, 40, 41], WINNING_NUMBERS).rank, 4)
    assert.equal(checkLottoResult([1, 2, 3, 40, 41, 42], WINNING_NUMBERS).rank, 5)
  })

  it('returns no prize when less than 3 numbers match', () => {
    const result = checkLottoResult([10, 11, 12, 13, 14, 15], WINNING_NUMBERS)
    assert.equal(result.rank, 0)
    assert.equal(result.message, '낙첨')
  })
})
