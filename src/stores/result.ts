import { type LottoFormSchema, type LottoSchema } from '@/schemas/lotto'
import { type NumberStatsMap } from '@/types/lotto'
import { create } from 'zustand'
import { useConfigStore } from './config'
import {
  checkLottoResult,
  generateLottoNumbers,
  normalizeAndCompleteLottoNumbers,
} from '@/lib/lotto'
import {
  updateNumberStats,
  updateWinningNumberStats,
} from '@/lib/lotto-submission'

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

  // 실행 함수
  submitLotto: (forms: LottoFormSchema[]) => void

  // 초기화
  initialize: () => void
}

export const useResultStore = create<ResultState>((set, get) => ({
  usedMoney: 0,
  setUsedMoney: (money) => set({ usedMoney: money }),
  addUsedMoney: (money) => set((state) => ({ usedMoney: state.usedMoney + money })),
  submittedCount: 0,
  setSubmittedCount: (count) => set({ submittedCount: count }),
  addSubmittedCount: (count) =>
    set((state) => ({ submittedCount: state.submittedCount + count })),
  submittedTickets: [],
  setSubmittedTickets: (tickets) => set({ submittedTickets: tickets }),
  winningNumbers: null,
  setWinningNumbers: (numbers) => set({ winningNumbers: numbers }),
  winningRankCounts: {},
  setWinningRankCounts: (counts) => set({ winningRankCounts: counts }),
  profitRate: 0,
  setProfitRate: (rate) => set({ profitRate: rate }),
  totalPrize: 0,
  setTotalPrize: (amount) => set({ totalPrize: amount }),
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
  submitLotto: (validForms: LottoFormSchema[]) => {
    const {
      addSubmittedCount,
      addUsedMoney,
      setSubmittedTickets,
      setWinningNumbers,
      addTotalPrize,
      setNumberStatsMap,
    } = get()
    const { prizeMap } = useConfigStore.getState()
    const cost = validForms.length * 1000

    if (validForms.length === 0) return

    addSubmittedCount(1)
    addUsedMoney(cost)
    const normalizedForms = validForms.map((form) =>
      normalizeAndCompleteLottoNumbers(form.numbers)
    )
    setSubmittedTickets(normalizedForms)
    const winningNumbers = generateLottoNumbers({ isContainBonusNumber: true })
    setWinningNumbers(winningNumbers)

    const prizes = normalizedForms.reduce((acc, form) => {
      const result = checkLottoResult(form, winningNumbers)
      setNumberStatsMap((currentStatsMap) =>
        updateNumberStats(currentStatsMap, form, result.matchedNumbers)
      )
      const prize = prizeMap[result.rank as keyof typeof prizeMap] || 0
      return acc + prize
    }, 0)
    setNumberStatsMap((currentStats) =>
      updateWinningNumberStats(currentStats, winningNumbers)
    )

    addTotalPrize(prizes)
  },
  initialize: () =>
    set({
      usedMoney: 0,
      submittedCount: 0,
      submittedTickets: [],
      winningNumbers: null,
      winningRankCounts: {},
      totalPrize: 0,
      numberStatsMap: {},
      profitRate: 0,
    }),
}))
