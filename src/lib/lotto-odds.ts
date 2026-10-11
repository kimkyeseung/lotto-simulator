import type { WinningRank } from '../types/lotto'

function combination(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  let result = 1
  for (let i = 1; i <= k; i++) {
    result = (result * (n - k + i)) / i
  }
  return Math.round(result)
}

/** 45개 중 6개를 고르는 경우의 수: 8,145,060 */
export const TOTAL_COMBINATIONS = combination(45, 6)

/** 1게임당 등수별 당첨 확률 */
export const RANK_PROBABILITIES: Record<Exclude<WinningRank, 0>, number> = {
  1: 1 / TOTAL_COMBINATIONS,
  // 5개 일치 + 보너스 일치
  2: 6 / TOTAL_COMBINATIONS,
  // 5개 일치 + 보너스 불일치 (남은 38개 중 1개)
  3: (combination(6, 5) * 38) / TOTAL_COMBINATIONS,
  4: (combination(6, 4) * combination(39, 2)) / TOTAL_COMBINATIONS,
  5: (combination(6, 3) * combination(39, 3)) / TOTAL_COMBINATIONS,
}

/** 1게임에서 당첨번호 6개 중 k개(0~6)를 맞힐 확률 (초기하분포) */
export function getMatchCountProbabilities(): number[] {
  return Array.from(
    { length: 7 },
    (_, k) => (combination(6, k) * combination(39, 6 - k)) / TOTAL_COMBINATIONS
  )
}
