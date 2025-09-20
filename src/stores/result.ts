import { type LottoSchema } from '@/schemas/lotto'
import { create } from 'zustand'

type Tickets = LottoSchema[]

interface ResultState {
  // 사용한 돈, 제출된 티켓
  usedMoney: number
  setUsedMoney: (money: number) => void
  submittedTickets: Tickets
  setSubmittedTickets: (tickets: Tickets) => void

  // 당첨 결과
  winningNumbers: LottoSchema | null
  setWinningNumbers: (numbers: LottoSchema | null) => void
  winningRankCounts: Record<string, number>
  setWinningRankCounts: (counts: Record<string, number>) => void

  // 수익률
  profitRate: number
  setProfitRate: (rate: number) => void
}

export const useResultStore = create<ResultState>((set) => ({
  usedMoney: 0,
  setUsedMoney: (money) => set(() => ({ usedMoney: money })),
  submittedTickets: [],
  setSubmittedTickets: (tickets) => set(() => ({ submittedTickets: tickets })),
  winningNumbers: null,
  setWinningNumbers: (numbers) => set(() => ({ winningNumbers: numbers })),
  winningRankCounts: {},
  setWinningRankCounts: (counts) => set(() => ({ winningRankCounts: counts })),
  profitRate: 0,
  setProfitRate: (rate) => set(() => ({ profitRate: rate })),
}))
