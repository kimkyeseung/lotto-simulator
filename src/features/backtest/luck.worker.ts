import type { Draw, PrizeMap } from '@/lib/backtest'
import { simulateRandomPlayers } from '@/lib/backtest-insights'

export type LuckWorkerRequest = {
  draws: Draw[]
  gamesPerDraw: number
  playerCount: number
  fallbackPrizes: PrizeMap
}

self.onmessage = (event: MessageEvent<LuckWorkerRequest>) => {
  const { draws, gamesPerDraw, playerCount, fallbackPrizes } = event.data
  const results = simulateRandomPlayers(
    draws,
    gamesPerDraw,
    playerCount,
    fallbackPrizes
  )
  self.postMessage(results, { transfer: [results.buffer] })
}
