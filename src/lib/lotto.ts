import { type WinningRank } from '@/types/lotto'

/**
 * Fisher-Yates Shuffle 알고리즘을 사용한 효율적인 로또 번호 생성
 * - 시간 복잡도: O(n) - 기존 while + includes() O(n²)에서 대폭 개선
 * - 중복 체크 불필요, 항상 유일한 번호 보장
 *
 * @param isContainBonusNumber 보너스 번호 포함 여부 (기본값: false)
 * @returns 정렬된 로또 번호 배열 (보너스 포함 시 마지막이 보너스)
 */
export function generateLottoNumbers({
  isContainBonusNumber = false,
}: {
  isContainBonusNumber?: boolean
}): number[] {
  // 1부터 45까지의 숫자 풀 생성
  const pool = Array.from({ length: 45 }, (_, i) => i + 1)
  const limit = isContainBonusNumber ? 7 : 6

  // Fisher-Yates Shuffle: 필요한 개수만 섞기
  for (let i = 0; i < limit; i++) {
    // i부터 44까지 범위에서 랜덤 인덱스 선택
    const j = i + Math.floor(Math.random() * (45 - i))
    // 현재 위치(i)와 랜덤 위치(j)의 값 교환
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  // 섞인 배열의 처음 limit개 추출
  const numbers = pool.slice(0, limit)

  // 보너스 번호 분리
  const bonusNumber = isContainBonusNumber ? numbers.pop() : null

  // 메인 번호 오름차순 정렬
  numbers.sort((a, b) => a - b)

  // 보너스 번호가 있으면 마지막에 추가
  return bonusNumber ? [...numbers, bonusNumber] : numbers
}

/**
 * 사용자 번호 배열을 검증하고 6개로 완성하는 함수 (Fisher-Yates 개선)
 * - 6개를 초과하면 오류 발생
 * - 6개 미만이면 1~45 사이의 중복되지 않는 숫자로 채움
 * - 시간 복잡도: O(n) - 기존 while + has() 방식보다 효율적
 *
 * @param userNumbers 사용자가 선택한 번호 배열
 * @returns 6개의 숫자로 완성된 배열 (오름차순 정렬)
 */
export function normalizeAndCompleteLottoNumbers(
  userNumbers: number[]
): number[] {
  if (userNumbers.length > 6) {
    throw new Error('로또 번호는 6개를 초과할 수 없습니다.')
  }

  // 중복 제거 및 유효한 사용자 번호 추출
  const userNumberSet = new Set(userNumbers)
  const validUserNumbers = Array.from(userNumberSet)

  // 이미 6개면 바로 정렬하여 반환
  if (validUserNumbers.length === 6) {
    return validUserNumbers.sort((a, b) => a - b)
  }

  // 부족한 개수 계산
  const needed = 6 - validUserNumbers.length

  // 사용 가능한 번호 풀 생성 (사용자가 선택하지 않은 번호만)
  const availableNumbers = Array.from({ length: 45 }, (_, i) => i + 1).filter(
    (num) => !userNumberSet.has(num)
  )

  // Fisher-Yates Shuffle로 필요한 개수만큼 선택
  for (let i = 0; i < needed; i++) {
    const j = i + Math.floor(Math.random() * (availableNumbers.length - i))
    ;[availableNumbers[i], availableNumbers[j]] = [
      availableNumbers[j],
      availableNumbers[i],
    ]
  }

  // 사용자 번호 + 랜덤 선택 번호 결합 후 정렬
  return [...validUserNumbers, ...availableNumbers.slice(0, needed)].sort(
    (a, b) => a - b
  )
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
