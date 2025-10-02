import { type LottoSchema } from '@/schemas/lotto'
import { type NumberStatsMap } from '@/types/lotto'
import { create } from 'zustand'

type Tickets = LottoSchema[]

interface ResultState {
  // 사용한 돈, 제출된 티켓
  usedMoney: number
  setUsedMoney: (money: number) => void
  addUsedMoney: (money: number) => void

  submittedCount: number
  setSubmittedCount: (count: number) => void
  addSubmittedCount: (count: number) => void

  submittedTickets: Tickets
  setSubmittedTickets: (tickets: Tickets) => void

  // 당첨 결과
  winningNumbers: LottoSchema | null
  setWinningNumbers: (numbers: LottoSchema | null) => void
  winningRankCounts: Record<string, number>
  setWinningRankCounts: (counts: Record<string, number>) => void

  // 당첨금
  totalPrize: number
  setTotalPrize: (amount: number) => void
  addTotalPrize: (amount: number) => void

  // 숫자 통계
  numberStatsMap: NumberStatsMap
  setNumberStatsMap: (
    updater: NumberStatsMap | ((currentStats: NumberStatsMap) => NumberStatsMap)
  ) => void

  // 수익률
  profitRate: number
  setProfitRate: (rate: number) => void

  // 초기화
  initialize: () => void
}

export const useResultStore = create<ResultState>((set) => ({
  usedMoney: 0,
  setUsedMoney: (money) => set(() => ({ usedMoney: money })),
  addUsedMoney: (money: number) =>
    set((state) => ({ usedMoney: state.usedMoney + money })),
  submittedCount: 0,
  setSubmittedCount: (count) => set(() => ({ submittedCount: count })),
  addSubmittedCount: (count) =>
    set((state) => ({ submittedCount: state.submittedCount + count })),
  submittedTickets: [],
  setSubmittedTickets: (tickets) => set(() => ({ submittedTickets: tickets })),
  winningNumbers: null,
  setWinningNumbers: (numbers) => set(() => ({ winningNumbers: numbers })),
  winningRankCounts: {},
  setWinningRankCounts: (counts) => set(() => ({ winningRankCounts: counts })),
  profitRate: 0,
  setProfitRate: (rate) => set(() => ({ profitRate: rate })),
  totalPrize: 0,
  setTotalPrize: (amount) => set(() => ({ totalPrize: amount })),
  addTotalPrize: (amount) =>
    set((state) => ({ totalPrize: state.totalPrize + amount })),
  numberStatsMap: {},
  setNumberStatsMap: (updater) => {
    set((state) => {
      if (typeof updater === 'function') {
        const newMap = updater(state.numberStatsMap)
        return { numberStatsMap: newMap }
      }

      return { numberStatsMap: updater }
    })
  },
  initialize: () =>
    set(() => ({
      usedMoney: 0,
      submittedCount: 0,
      submittedTickets: [],
      winningNumbers: null,
      winningRankCounts: {},
      totalPrize: 0,
      numberStatsMap: {},
      profitRate: 0,
    })),
}))
