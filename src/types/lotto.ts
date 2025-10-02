/**
 * 당첨 등수 (1-5등)
 */
export type WinningRank = 1 | 2 | 3 | 4 | 5 | 0

export type NumberStatsMap = {
  // 키는 1부터 45까지의 숫자 (key: number)
  [key: number]: SimulationStats
}

export type SimulationStats = {
  /** 총 시도(구매) 횟수 (예: 100회) */
  submittedCount: number
  /** 결과가 나온 횟수 (보통 submittedCount와 같으나, API 오류 등 예외 처리 시 분리될 수 있음) */
  resultCount: number
  /** 당첨(5등 이상)이 발생한 횟수 */
  hitCount: number
}
