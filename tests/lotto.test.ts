import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'

import {
  generateLottoNumbers,
  normalizeAndCompleteLottoNumbers,
  checkLottoResult,
} from '../src/lib/lotto.js'

describe('generateLottoNumbers', () => {
  describe('기본 로또 번호 생성 (보너스 번호 없음)', () => {
    it('6개의 번호를 생성해야 함', () => {
      const numbers = generateLottoNumbers({ isContainBonusNumber: false })
      assert.equal(numbers.length, 6)
    })

    it('모든 번호가 1-45 범위 내에 있어야 함', () => {
      const numbers = generateLottoNumbers({ isContainBonusNumber: false })
      numbers.forEach((num) => {
        assert.ok(num >= 1 && num <= 45, `번호 ${num}이 범위를 벗어남`)
      })
    })

    it('중복된 번호가 없어야 함', () => {
      const numbers = generateLottoNumbers({ isContainBonusNumber: false })
      const uniqueNumbers = new Set(numbers)
      assert.equal(
        uniqueNumbers.size,
        numbers.length,
        '중복된 번호가 존재합니다'
      )
    })

    it('번호가 오름차순으로 정렬되어야 함', () => {
      const numbers = generateLottoNumbers({ isContainBonusNumber: false })
      for (let i = 0; i < numbers.length - 1; i++) {
        assert.ok(
          numbers[i] < numbers[i + 1],
          `정렬 순서가 잘못됨: ${numbers[i]} >= ${numbers[i + 1]}`
        )
      }
    })

    it('여러 번 호출해도 항상 유효한 번호를 생성해야 함', () => {
      for (let i = 0; i < 100; i++) {
        const numbers = generateLottoNumbers({ isContainBonusNumber: false })
        assert.equal(numbers.length, 6)
        assert.equal(new Set(numbers).size, 6)
        numbers.forEach((num) => {
          assert.ok(num >= 1 && num <= 45)
        })
      }
    })
  })

  describe('보너스 번호 포함 로또 번호 생성', () => {
    it('7개의 번호를 생성해야 함 (메인 6개 + 보너스 1개)', () => {
      const numbers = generateLottoNumbers({ isContainBonusNumber: true })
      assert.equal(numbers.length, 7)
    })

    it('모든 번호가 1-45 범위 내에 있어야 함', () => {
      const numbers = generateLottoNumbers({ isContainBonusNumber: true })
      numbers.forEach((num) => {
        assert.ok(num >= 1 && num <= 45, `번호 ${num}이 범위를 벗어남`)
      })
    })

    it('중복된 번호가 없어야 함', () => {
      const numbers = generateLottoNumbers({ isContainBonusNumber: true })
      const uniqueNumbers = new Set(numbers)
      assert.equal(
        uniqueNumbers.size,
        numbers.length,
        '중복된 번호가 존재합니다'
      )
    })

    it('첫 6개의 번호는 오름차순으로 정렬되어야 함', () => {
      const numbers = generateLottoNumbers({ isContainBonusNumber: true })
      const mainNumbers = numbers.slice(0, 6)
      for (let i = 0; i < mainNumbers.length - 1; i++) {
        assert.ok(
          mainNumbers[i] < mainNumbers[i + 1],
          `정렬 순서가 잘못됨: ${mainNumbers[i]} >= ${mainNumbers[i + 1]}`
        )
      }
    })

    it('보너스 번호(7번째)는 정렬되지 않은 위치에 있을 수 있음', () => {
      // 보너스 번호는 마지막에 위치하며 정렬되지 않음
      const numbers = generateLottoNumbers({ isContainBonusNumber: true })
      assert.equal(numbers.length, 7)
      // 보너스 번호가 1-45 범위 내에만 있으면 됨
      const bonusNumber = numbers[6]
      assert.ok(bonusNumber >= 1 && bonusNumber <= 45)
    })
  })

  describe('기본값 동작', () => {
    it('인자 없이 호출하면 6개의 번호를 생성해야 함', () => {
      const numbers = generateLottoNumbers({})
      assert.equal(numbers.length, 6)
    })
  })
})

describe('normalizeAndCompleteLottoNumbers', () => {
  describe('유효한 입력 처리', () => {
    it('6개의 번호를 입력하면 그대로 반환 (정렬됨)', () => {
      const input = [5, 10, 15, 20, 25, 30]
      const result = normalizeAndCompleteLottoNumbers(input)
      assert.equal(result.length, 6)
      assert.deepEqual(result, [5, 10, 15, 20, 25, 30])
    })

    it('6개 미만의 번호는 자동으로 채워짐', () => {
      const input = [1, 2, 3]
      const result = normalizeAndCompleteLottoNumbers(input)
      assert.equal(result.length, 6)
      // 입력한 번호가 포함되어야 함
      assert.ok(result.includes(1))
      assert.ok(result.includes(2))
      assert.ok(result.includes(3))
    })

    it('빈 배열을 입력하면 6개의 번호를 생성', () => {
      const result = normalizeAndCompleteLottoNumbers([])
      assert.equal(result.length, 6)
      result.forEach((num) => {
        assert.ok(num >= 1 && num <= 45)
      })
    })

    it('1개의 번호만 입력해도 6개로 완성', () => {
      const input = [7]
      const result = normalizeAndCompleteLottoNumbers(input)
      assert.equal(result.length, 6)
      assert.ok(result.includes(7))
    })

    it('중복된 번호는 자동으로 제거됨', () => {
      const input = [1, 1, 2, 2, 3, 3]
      const result = normalizeAndCompleteLottoNumbers(input)
      assert.equal(result.length, 6)
      // 중복 제거 후 3개만 남고, 나머지 3개는 자동 생성
      assert.ok(result.includes(1))
      assert.ok(result.includes(2))
      assert.ok(result.includes(3))
    })
  })

  describe('정렬 및 중복 제거', () => {
    it('반환된 번호는 항상 오름차순으로 정렬됨', () => {
      const input = [45, 1, 30, 15]
      const result = normalizeAndCompleteLottoNumbers(input)
      for (let i = 0; i < result.length - 1; i++) {
        assert.ok(result[i] < result[i + 1])
      }
    })

    it('모든 번호가 유일해야 함', () => {
      const input = [5, 10, 15]
      const result = normalizeAndCompleteLottoNumbers(input)
      const uniqueNumbers = new Set(result)
      assert.equal(uniqueNumbers.size, 6)
    })

    it('생성된 번호는 1-45 범위 내에 있어야 함', () => {
      const input = [1, 2]
      const result = normalizeAndCompleteLottoNumbers(input)
      result.forEach((num) => {
        assert.ok(num >= 1 && num <= 45)
      })
    })
  })

  describe('에러 처리', () => {
    it('7개 이상의 번호를 입력하면 에러 발생', () => {
      const input = [1, 2, 3, 4, 5, 6, 7]
      assert.throws(
        () => normalizeAndCompleteLottoNumbers(input),
        /로또 번호는 6개를 초과할 수 없습니다/
      )
    })

    it('8개의 번호를 입력해도 에러 발생', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8]
      assert.throws(
        () => normalizeAndCompleteLottoNumbers(input),
        /로또 번호는 6개를 초과할 수 없습니다/
      )
    })

    it('중복 포함 7개를 입력하면 에러 발생 (중복 제거 전 길이 체크)', () => {
      // 실제로는 중복이 제거되어 6개 이하가 되므로 에러가 발생하지 않을 수 있음
      // 현재 구현은 length 체크를 먼저 하므로 에러 발생
      const input = [1, 1, 2, 3, 4, 5, 6]
      assert.throws(
        () => normalizeAndCompleteLottoNumbers(input),
        /로또 번호는 6개를 초과할 수 없습니다/
      )
    })
  })

  describe('엣지 케이스', () => {
    it('최소값과 최대값만 입력', () => {
      const input = [1, 45]
      const result = normalizeAndCompleteLottoNumbers(input)
      assert.equal(result.length, 6)
      assert.ok(result.includes(1))
      assert.ok(result.includes(45))
    })

    it('연속된 번호 입력', () => {
      const input = [1, 2, 3, 4, 5, 6]
      const result = normalizeAndCompleteLottoNumbers(input)
      assert.deepEqual(result, [1, 2, 3, 4, 5, 6])
    })

    it('여러 번 호출해도 입력한 번호는 항상 포함됨', () => {
      const input = [7, 14, 21]
      for (let i = 0; i < 50; i++) {
        const result = normalizeAndCompleteLottoNumbers(input)
        assert.ok(result.includes(7))
        assert.ok(result.includes(14))
        assert.ok(result.includes(21))
      }
    })
  })
})

describe('checkLottoResult', () => {
  const WINNING_NUMBERS = [1, 2, 3, 4, 5, 6, 7]

  describe('입력 검증', () => {
    it('사용자 번호가 6개가 아니면 에러 발생', () => {
      assert.throws(
        () => checkLottoResult([1, 2], WINNING_NUMBERS),
        /Invalid input/
      )
      assert.throws(
        () => checkLottoResult([1, 2, 3, 4, 5], WINNING_NUMBERS),
        /Invalid input/
      )
      assert.throws(
        () => checkLottoResult([1, 2, 3, 4, 5, 6, 7], WINNING_NUMBERS),
        /Invalid input/
      )
    })

    it('당첨 번호가 7개가 아니면 에러 발생', () => {
      assert.throws(
        () => checkLottoResult([1, 2, 3, 4, 5, 6], [1, 2, 3]),
        /Invalid input/
      )
      assert.throws(
        () => checkLottoResult([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6]),
        /Invalid input/
      )
      assert.throws(
        () => checkLottoResult([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6, 7, 8]),
        /Invalid input/
      )
    })
  })

  describe('1등 당첨 (6개 모두 일치)', () => {
    it('모든 메인 번호가 일치하면 1등', () => {
      const result = checkLottoResult([1, 2, 3, 4, 5, 6], WINNING_NUMBERS)
      assert.equal(result.rank, 1)
      assert.equal(result.message, '1등당첨')
      assert.deepEqual(result.matchedNumbers.sort(), [1, 2, 3, 4, 5, 6])
    })

    it('번호 순서가 달라도 1등 (정렬 무관)', () => {
      const result = checkLottoResult([6, 5, 4, 3, 2, 1], WINNING_NUMBERS)
      assert.equal(result.rank, 1)
      assert.equal(result.message, '1등당첨')
    })

    it('1등은 보너스 번호와 무관', () => {
      const winningWithDifferentBonus = [1, 2, 3, 4, 5, 6, 45]
      const result = checkLottoResult(
        [1, 2, 3, 4, 5, 6],
        winningWithDifferentBonus
      )
      assert.equal(result.rank, 1)
    })
  })

  describe('2등 당첨 (5개 + 보너스)', () => {
    it('5개 일치 + 보너스 일치 = 2등', () => {
      const result = checkLottoResult([1, 2, 3, 4, 5, 7], WINNING_NUMBERS)
      assert.equal(result.rank, 2)
      assert.equal(result.message, '2등당첨')
      assert.ok(result.matchedNumbers.includes(7), '보너스 번호 포함되어야 함')
      assert.equal(result.matchedNumbers.length, 6)
    })

    it('다른 조합으로도 2등 확인', () => {
      const result = checkLottoResult([2, 3, 4, 5, 6, 7], WINNING_NUMBERS)
      assert.equal(result.rank, 2)
      assert.equal(result.message, '2등당첨')
    })

    it('보너스 번호가 다르면 2등이 아님', () => {
      const result = checkLottoResult([1, 2, 3, 4, 5, 8], WINNING_NUMBERS)
      assert.notEqual(result.rank, 2)
      assert.equal(result.rank, 3) // 5개만 일치하므로 3등
    })
  })

  describe('3등 당첨 (5개 일치, 보너스 불일치)', () => {
    it('5개 일치 + 보너스 불일치 = 3등', () => {
      const result = checkLottoResult([1, 2, 3, 4, 5, 45], WINNING_NUMBERS)
      assert.equal(result.rank, 3)
      assert.equal(result.message, '3등당첨')
      assert.equal(result.matchedNumbers.length, 5)
    })

    it('보너스 번호가 포함되지 않았는지 확인', () => {
      const result = checkLottoResult([1, 2, 3, 4, 5, 10], WINNING_NUMBERS)
      assert.equal(result.rank, 3)
      assert.ok(!result.matchedNumbers.includes(7))
      assert.ok(!result.matchedNumbers.includes(10))
    })
  })

  describe('4등 당첨 (4개 일치)', () => {
    it('4개 일치 = 4등', () => {
      const result = checkLottoResult([1, 2, 3, 4, 40, 41], WINNING_NUMBERS)
      assert.equal(result.rank, 4)
      assert.equal(result.message, '4등당첨')
      assert.equal(result.matchedNumbers.length, 4)
    })

    it('보너스 번호가 있어도 4등', () => {
      const result = checkLottoResult([1, 2, 3, 4, 7, 40], WINNING_NUMBERS)
      assert.equal(result.rank, 4)
      // 4개 일치 + 보너스 = 5개 matchedNumbers
      assert.equal(result.matchedNumbers.length, 5)
      assert.ok(result.matchedNumbers.includes(7))
    })

    it('다양한 조합으로 4등 확인', () => {
      assert.equal(
        checkLottoResult([1, 2, 5, 6, 30, 35], WINNING_NUMBERS).rank,
        4
      )
      assert.equal(
        checkLottoResult([3, 4, 5, 6, 20, 25], WINNING_NUMBERS).rank,
        4
      )
    })
  })

  describe('5등 당첨 (3개 일치)', () => {
    it('3개 일치 = 5등', () => {
      const result = checkLottoResult([1, 2, 3, 40, 41, 42], WINNING_NUMBERS)
      assert.equal(result.rank, 5)
      assert.equal(result.message, '5등당첨')
      assert.equal(result.matchedNumbers.length, 3)
    })

    it('보너스 번호가 있어도 5등', () => {
      const result = checkLottoResult([1, 2, 3, 7, 40, 41], WINNING_NUMBERS)
      assert.equal(result.rank, 5)
      // 3개 일치 + 보너스 = 4개 matchedNumbers
      assert.equal(result.matchedNumbers.length, 4)
    })

    it('최소 당첨 케이스 확인', () => {
      assert.equal(
        checkLottoResult([1, 5, 6, 30, 35, 40], WINNING_NUMBERS).rank,
        5
      )
    })
  })

  describe('낙첨 (2개 이하 일치)', () => {
    it('일치하는 번호가 없으면 낙첨', () => {
      const result = checkLottoResult(
        [10, 11, 12, 13, 14, 15],
        WINNING_NUMBERS
      )
      assert.equal(result.rank, 0)
      assert.equal(result.message, '낙첨')
      assert.equal(result.matchedNumbers.length, 0)
    })

    it('1개만 일치해도 낙첨', () => {
      const result = checkLottoResult([1, 10, 11, 12, 13, 14], WINNING_NUMBERS)
      assert.equal(result.rank, 0)
      assert.equal(result.message, '낙첨')
      assert.equal(result.matchedNumbers.length, 1)
    })

    it('2개 일치해도 낙첨', () => {
      const result = checkLottoResult([1, 2, 10, 11, 12, 13], WINNING_NUMBERS)
      assert.equal(result.rank, 0)
      assert.equal(result.message, '낙첨')
      assert.equal(result.matchedNumbers.length, 2)
    })

    it('보너스 번호만 일치해도 낙첨', () => {
      const result = checkLottoResult([7, 10, 11, 12, 13, 14], WINNING_NUMBERS)
      assert.equal(result.rank, 0)
      assert.equal(result.message, '낙첨')
      // 보너스만 일치하면 matchedNumbers에 포함되지만 rank는 0
      assert.equal(result.matchedNumbers.length, 1)
    })
  })

  describe('matchedNumbers 검증', () => {
    it('일치한 번호가 정렬되어 반환됨', () => {
      const result = checkLottoResult([6, 5, 4, 3, 2, 1], WINNING_NUMBERS)
      const sorted = [...result.matchedNumbers].sort((a, b) => a - b)
      assert.deepEqual(result.matchedNumbers, sorted)
    })

    it('보너스 번호가 일치하면 matchedNumbers에 포함됨', () => {
      const result = checkLottoResult([1, 2, 3, 4, 5, 7], WINNING_NUMBERS)
      assert.ok(result.matchedNumbers.includes(7))
    })

    it('일치하지 않은 번호는 포함되지 않음', () => {
      const result = checkLottoResult([1, 2, 3, 10, 20, 30], WINNING_NUMBERS)
      assert.ok(!result.matchedNumbers.includes(10))
      assert.ok(!result.matchedNumbers.includes(20))
      assert.ok(!result.matchedNumbers.includes(30))
    })
  })

  describe('엣지 케이스', () => {
    it('모든 번호가 최소값일 때', () => {
      const winningMin = [1, 2, 3, 4, 5, 6, 7]
      const result = checkLottoResult([1, 2, 3, 4, 5, 6], winningMin)
      assert.equal(result.rank, 1)
    })

    it('모든 번호가 최대값 근처일 때', () => {
      const winningMax = [39, 40, 41, 42, 43, 44, 45]
      const result = checkLottoResult(
        [39, 40, 41, 42, 43, 44],
        winningMax
      )
      assert.equal(result.rank, 1)
    })

    it('연속된 번호 vs 분산된 번호', () => {
      const winningConsecutive = [1, 2, 3, 4, 5, 6, 7]
      const userSpread = [1, 10, 20, 30, 40, 45]
      const result = checkLottoResult(userSpread, winningConsecutive)
      assert.equal(result.rank, 0) // 1개만 일치
    })
  })

  describe('실제 시나리오', () => {
    it('실제 로또 1등 케이스 시뮬레이션', () => {
      const actual = [7, 12, 15, 23, 31, 42, 5]
      const user = [7, 12, 15, 23, 31, 42]
      const result = checkLottoResult(user, actual)
      assert.equal(result.rank, 1)
    })

    it('실제 로또 2등 케이스 시뮬레이션', () => {
      const actual = [7, 12, 15, 23, 31, 42, 5]
      const user = [7, 12, 15, 23, 31, 5] // 5개 + 보너스
      const result = checkLottoResult(user, actual)
      assert.equal(result.rank, 2)
    })

    it('아쉬운 3등 케이스 (보너스 하나 차이)', () => {
      const actual = [7, 12, 15, 23, 31, 42, 5]
      const user = [7, 12, 15, 23, 31, 1] // 5개만 일치
      const result = checkLottoResult(user, actual)
      assert.equal(result.rank, 3)
    })
  })
})

describe('통합 테스트: 전체 워크플로우', () => {
  it('번호 생성 -> 완성 -> 결과 확인 워크플로우', () => {
    // 1. 당첨 번호 생성
    const winningNumbers = generateLottoNumbers({ isContainBonusNumber: true })
    assert.equal(winningNumbers.length, 7)

    // 2. 사용자 번호 부분 입력
    const userPartialNumbers = [1, 2, 3]
    const userCompleteNumbers = normalizeAndCompleteLottoNumbers(
      userPartialNumbers
    )
    assert.equal(userCompleteNumbers.length, 6)

    // 3. 결과 확인
    const result = checkLottoResult(userCompleteNumbers, winningNumbers)
    assert.ok(result.rank >= 0 && result.rank <= 5)
    assert.ok(result.message)
    assert.ok(Array.isArray(result.matchedNumbers))
  })

  it('여러 티켓 동시 검증', () => {
    const winningNumbers = generateLottoNumbers({ isContainBonusNumber: true })

    const tickets = [
      normalizeAndCompleteLottoNumbers([1, 2, 3]),
      normalizeAndCompleteLottoNumbers([10, 20, 30]),
      normalizeAndCompleteLottoNumbers([5, 15, 25, 35]),
    ]

    tickets.forEach((ticket) => {
      const result = checkLottoResult(ticket, winningNumbers)
      assert.ok(result.rank >= 0 && result.rank <= 5)
    })
  })

  it('대량 시뮬레이션 (1000회)', () => {
    const winningNumbers = generateLottoNumbers({ isContainBonusNumber: true })
    const rankCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    for (let i = 0; i < 1000; i++) {
      const userNumbers = generateLottoNumbers({ isContainBonusNumber: false })
      const result = checkLottoResult(userNumbers, winningNumbers)
      rankCounts[result.rank]++
    }

    // 통계적 검증: 대부분 낙첨이어야 함
    assert.ok(rankCounts[0] > 500, '대부분의 티켓은 낙첨이어야 함')

    // 모든 등수의 합이 1000이어야 함
    const total = Object.values(rankCounts).reduce((a, b) => a + b, 0)
    assert.equal(total, 1000)
  })
})
