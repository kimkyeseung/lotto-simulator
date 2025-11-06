import { type LottoFormSchema, type LottoSchema } from '@/schemas/lotto'
import { type NumberStatsMap, type WinningRank } from '@/types/lotto'
import { toast } from 'sonner'
import { create } from 'zustand'
import {
  checkLottoResult,
  generateLottoNumbers,
  normalizeAndCompleteLottoNumbers,
} from '@/lib/lotto'
import {
  updateNumberStats,
  updateWinningNumberStats,
} from '@/lib/lotto-submission'
import { CustomToaster } from '@/components/custom-toaster'
import { FancyToaster } from '@/components/fancy-toaster'
import { useConfigStore } from './config'

type Tickets = LottoSchema[]

export type SimulationSnapshot = {
  id: number
  timestamp: number
  submittedCount: number
  usedMoney: number
  totalPrize: number
  netProfit: number
  profitRate: number
}

const TRACKED_RANKS: WinningRank[] = [1, 2, 3, 4, 5, 0]

const createInitialWinningRankCounts = (): Record<WinningRank, number> => ({
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
})

const MAX_HISTORY_LENGTH = 200

interface ResultState {
  isFifthRankToastShown: boolean
  setFifthRankToastShown: (shown: boolean) => void

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
  winningRankCounts: Record<WinningRank, number>
  setWinningRankCounts: (
    updater:
      | Record<WinningRank, number>
      | ((counts: Record<WinningRank, number>) => Record<WinningRank, number>)
  ) => void

  // 당첨금
  totalPrize: number
  setTotalPrize: (amount: number) => void
  addTotalPrize: (amount: number) => void

  // 숫자 통계
  numberStatsMap: NumberStatsMap
  setNumberStatsMap: (
    updater: NumberStatsMap | ((currentStats: NumberStatsMap) => NumberStatsMap)
  ) => void

  // 진행 기록
  history: SimulationSnapshot[]
  setHistory: (
    updater:
      | SimulationSnapshot[]
      | ((history: SimulationSnapshot[]) => SimulationSnapshot[])
  ) => void

  // 실행 함수
  submitLotto: (forms: LottoFormSchema[]) => void

  // 초기화
  initialize: () => void
}

export const useResultStore = create<ResultState>((set, get) => ({
  isFifthRankToastShown: false,
  setFifthRankToastShown: (shown) => set({ isFifthRankToastShown: shown }),
  usedMoney: 0,
  setUsedMoney: (money) => set({ usedMoney: money }),
  addUsedMoney: (money) =>
    set((state) => ({ usedMoney: state.usedMoney + money })),
  submittedCount: 0,
  setSubmittedCount: (count) => set({ submittedCount: count }),
  addSubmittedCount: (count) =>
    set((state) => ({ submittedCount: state.submittedCount + count })),
  submittedTickets: [],
  setSubmittedTickets: (tickets) => set({ submittedTickets: tickets }),
  winningNumbers: null,
  setWinningNumbers: (numbers) => set({ winningNumbers: numbers }),
  winningRankCounts: createInitialWinningRankCounts(),
  setWinningRankCounts: (updater) =>
    set((state) => {
      if (typeof updater === 'function') {
        const nextCounts = updater(state.winningRankCounts)
        return { winningRankCounts: nextCounts }
      }
      return { winningRankCounts: updater }
    }),
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
  history: [],
  setHistory: (updater) =>
    set((state) => {
      if (typeof updater === 'function') {
        return { history: updater(state.history) }
      }
      return { history: updater }
    }),
  submitLotto: (validForms: LottoFormSchema[]) => {
    if (validForms.length === 0) return

    const {
      addSubmittedCount,
      addUsedMoney,
      setSubmittedTickets,
      setWinningNumbers,
      addTotalPrize,
      setNumberStatsMap,
      isFifthRankToastShown,
      setFifthRankToastShown,
      setWinningRankCounts,
      setHistory,
    } = get()
    const { prizeMap } = useConfigStore.getState()
    const cost = validForms.length * 1000

    addSubmittedCount(1)
    addUsedMoney(cost)
    const normalizedForms = validForms.map((form) =>
      normalizeAndCompleteLottoNumbers(form.numbers)
    )
    setSubmittedTickets(normalizedForms)
    const winningNumbers = generateLottoNumbers({ isContainBonusNumber: true })
    setWinningNumbers(winningNumbers)

    const submissionRankCounts = createInitialWinningRankCounts()

    const prizes = normalizedForms.reduce((acc, form) => {
      const result = checkLottoResult(form, winningNumbers)
      const prize = prizeMap[result.rank as keyof typeof prizeMap] || 0
      if (result.rank !== 0) {
        switch (result.rank) {
          case 1:
          case 2:
          case 3:
            toast.custom(() => (
              <FancyToaster
                rank={result.rank}
                prize={prize}
                numbers={form}
                winningNumbers={winningNumbers}
              />
            ))
            break
          case 4:
            toast.custom(() => (
              <CustomToaster
                rank={result.rank}
                prize={prize}
                numbers={form}
                winningNumbers={winningNumbers}
              />
            ))
            break
          case 5:
            if (!isFifthRankToastShown) {
              toast.custom(() => (
                <CustomToaster
                  rank={result.rank}
                  prize={prize}
                  numbers={form}
                  winningNumbers={winningNumbers}
                />
              ))
              setFifthRankToastShown(true)
            }
            break
        }
      }
      submissionRankCounts[result.rank] =
        (submissionRankCounts[result.rank] ?? 0) + 1
      setNumberStatsMap((currentStatsMap) =>
        updateNumberStats(currentStatsMap, form, result.matchedNumbers)
      )
      return acc + prize
    }, 0)
    setNumberStatsMap((currentStats) =>
      updateWinningNumberStats(currentStats, winningNumbers)
    )

    setWinningRankCounts((currentCounts) => {
      const nextCounts = { ...currentCounts }
      for (const rank of TRACKED_RANKS) {
        const submissionCount = submissionRankCounts[rank] ?? 0
        if (!submissionCount) continue
        nextCounts[rank] = (nextCounts[rank] ?? 0) + submissionCount
      }
      return nextCounts
    })

    addTotalPrize(prizes)

    const {
      usedMoney: updatedUsedMoney,
      totalPrize: updatedTotalPrize,
      submittedCount: updatedSubmittedCount,
    } = get()

    setHistory((currentHistory) => {
      const netProfit = updatedTotalPrize - updatedUsedMoney
      const profitRate =
        updatedUsedMoney === 0
          ? 0
          : ((updatedTotalPrize - updatedUsedMoney) / updatedUsedMoney) * 100

      const lastSnapshot = currentHistory[currentHistory.length - 1]

      const nextSnapshot: SimulationSnapshot = {
        id: (lastSnapshot?.id ?? 0) + 1,
        timestamp: Date.now(),
        submittedCount: updatedSubmittedCount,
        usedMoney: updatedUsedMoney,
        totalPrize: updatedTotalPrize,
        netProfit,
        profitRate,
      }

      const nextHistory = [...currentHistory, nextSnapshot]
      if (nextHistory.length > MAX_HISTORY_LENGTH) {
        return nextHistory.slice(nextHistory.length - MAX_HISTORY_LENGTH)
      }
      return nextHistory
    })
  },
  initialize: () =>
    set({
      usedMoney: 0,
      submittedCount: 0,
      submittedTickets: [],
      winningNumbers: null,
      winningRankCounts: createInitialWinningRankCounts(),
      totalPrize: 0,
      numberStatsMap: {},
      history: [],
      isFifthRankToastShown: false,
    }),
}))
