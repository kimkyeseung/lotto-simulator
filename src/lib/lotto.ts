import { type WinningRank } from '@/types/lotto'

export function generateLottoNumbers({
  isContainBonusNumber = false,
}: {
  isContainBonusNumber?: boolean
}): number[] {
  const numbers: number[] = []
  const limit = isContainBonusNumber ? 7 : 6
  while (numbers.length < limit) {
    // 1부터 45까지의 무작위 정수 생성
    const randomNumber = Math.floor(Math.random() * 45) + 1

    // 배열에 이미 존재하는지 확인 (중복 제거)
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber)
    }
  }

  const bonusNumber = isContainBonusNumber ? numbers.pop() : null
  
  // 오름차순으로 정렬
  numbers.sort((a, b) => a - b)

  return bonusNumber ? [...numbers, bonusNumber] : numbers
}

/**
 * 사용자 번호 배열을 검증하고 6개로 완성하는 함수.
 * - 6개를 초과하면 오류 발생
 * - 6개 미만이면 1~45 사이의 중복되지 않는 숫자로 채움
 * @param userNumbers 사용자가 선택한 번호 배열
 * @returns 6개의 숫자로 완성된 배열
 */
export function normalizeAndCompleteLottoNumbers(
  userNumbers: number[]
): number[] {
  if (userNumbers.length > 6) {
    throw new Error('로또 번호는 6개를 초과할 수 없습니다.')
  }

  // 중복을 허용하지 않고, 기존 숫자를 유지하기 위해 Set 사용
  const numbers = new Set(userNumbers)

  while (numbers.size < 6) {
    const randomNumber = Math.floor(Math.random() * 45) + 1
    if (!numbers.has(randomNumber)) {
      numbers.add(randomNumber)
    }
  }

  // Set을 배열로 변환하고 오름차순으로 정렬하여 반환
  return Array.from(numbers).sort((a, b) => a - b)
}

interface WinningResult {
  rank: WinningRank
  message: string
  matchedNumbers: number[]
}

export function checkLottoResult(
  userNumbers: number[],
  winningNumbers: number[]
): WinningResult {
  if (userNumbers.length !== 6 || winningNumbers.length !== 7) {
    throw new Error(
      'Invalid input: userNumbers must have 6 numbers and winningNumbers must have 7 numbers.'
    )
  }

  const mainWinningNumbers = winningNumbers.slice(0, 6)
  const mainWinningSet = new Set(mainWinningNumbers)
  const userSet = new Set(userNumbers)

  const matchedMainNumbers = Array.from(userSet)
    .filter((num) => mainWinningSet.has(num))
    .sort((a, b) => a - b)

  const mainMatchCount = matchedMainNumbers.length
  const bonusNumber = winningNumbers[6]
  const hasBonus = userSet.has(bonusNumber)
  const matchedNumbers = hasBonus
    ? [...matchedMainNumbers, bonusNumber]
    : matchedMainNumbers

  if (mainMatchCount === 6) {
    return { rank: 1, matchedNumbers, message: '1등당첨' }
  }

  if (mainMatchCount === 5) {
    if (hasBonus) {
      return { rank: 2, matchedNumbers, message: '2등당첨' }
    }
    return { rank: 3, matchedNumbers, message: '3등당첨' }
  }

  if (mainMatchCount === 4) {
    return { rank: 4, matchedNumbers, message: '4등당첨' }
  }

  if (mainMatchCount === 3) {
    return { rank: 5, matchedNumbers, message: '5등당첨' }
  }

  return { rank: 0, matchedNumbers, message: '낙첨' }
}
