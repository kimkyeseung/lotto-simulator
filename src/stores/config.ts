import type { WinningRank } from '@/types/lotto'
import { create } from 'zustand'

interface ConfigState {
  isAutoRunning: boolean
  prizeMap: Record<WinningRank, number> // Record<등수, 상금>

  toggleAutoRun: () => void
  setRunning: (isRunning: boolean) => void
  setPrize: (rank: WinningRank, amount: number) => void
}

export const useConfigStore = create<ConfigState>((set) => ({
  isAutoRunning: false,
  prizeMap: {
    1: 2_000_000_000, // 1등: 20억
    2: 50_000_000, // 2등: 5천만원
    3: 1_500_000, // 3등: 150만원
    4: 50_000, // 4등: 5만원
    5: 5_000, // 5등: 5천원
    0: 0,
  },

  toggleAutoRun: () =>
    set((state) => ({ isAutoRunning: !state.isAutoRunning })),

  setRunning: (isRunning) => set({ isAutoRunning: isRunning }),

  setPrize: (rank, amount) =>
    set((state) => ({
      prizeMap: {
        ...state.prizeMap,
        [rank]: amount,
      },
    })),
}))
