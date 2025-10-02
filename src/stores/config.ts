import { create } from 'zustand'

interface ConfigState {
  isAutoRunning: boolean

  toggleAutoRun: () => void
  setRunning: (isRunning: boolean) => void
}

export const useConfigStore = create<ConfigState>((set) => ({
  isAutoRunning: false,

  toggleAutoRun: () =>
    set((state) => ({ isAutoRunning: !state.isAutoRunning })),

  setRunning: (isRunning) => set({ isAutoRunning: isRunning }),
}))
