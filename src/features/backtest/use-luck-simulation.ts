import { useEffect, useState } from 'react'
import type { Draw, PrizeMap } from '@/lib/backtest'
import type { LuckWorkerRequest } from './luck.worker'

export const RANDOM_PLAYER_COUNT = 1000

// 무작위 플레이어 결과는 사용자의 번호와 무관하므로 기간·게임 수가 같으면 재사용
const cache = new Map<string, Float64Array>()

type LuckSimulation =
  | { status: 'idle' | 'running' | 'error'; netProfits: null }
  | { status: 'done'; netProfits: Float64Array }

/** 같은 조건으로 무작위 번호를 산 가상 플레이어들의 순손익 분포를 Web Worker에서 계산 */
export function useLuckSimulation(
  draws: Draw[],
  gamesPerDraw: number,
  fallbackPrizes: PrizeMap
): LuckSimulation {
  const firstNo = draws[0]?.no
  const lastNo = draws[draws.length - 1]?.no
  const key = `${firstNo}-${lastNo}-${gamesPerDraw}`
  const [state, setState] = useState<{ key: string; value: LuckSimulation }>({
    key: '',
    value: { status: 'idle', netProfits: null },
  })

  useEffect(() => {
    if (draws.length === 0 || gamesPerDraw === 0) return

    const cached = cache.get(key)
    if (cached) {
      setState({ key, value: { status: 'done', netProfits: cached } })
      return
    }

    setState({ key, value: { status: 'running', netProfits: null } })
    const worker = new Worker(new URL('./luck.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<Float64Array>) => {
      cache.set(key, event.data)
      setState({ key, value: { status: 'done', netProfits: event.data } })
      worker.terminate()
    }
    worker.onerror = () => {
      setState({ key, value: { status: 'error', netProfits: null } })
      worker.terminate()
    }
    const request: LuckWorkerRequest = {
      draws,
      gamesPerDraw,
      playerCount: RANDOM_PLAYER_COUNT,
      fallbackPrizes,
    }
    worker.postMessage(request)

    return () => worker.terminate()
    // draws는 key(기간)로 대표되므로 key 변경 시에만 다시 계산
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  if (state.key !== key) return { status: 'running', netProfits: null }
  return state.value
}
