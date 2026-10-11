import { createJSONStorage, type StateStorage } from 'zustand/middleware'

export const STORAGE_KEY_PREFIX = 'lotto-simulator'

/**
 * localStorage 쓰기를 지연시켜 묶어서 저장하는 storage
 * - 자동 구매(100ms 간격) 중 매번 직렬화/저장하지 않도록 마지막 값만 저장
 * - 탭을 닫거나 숨길 때 남은 쓰기를 즉시 반영
 * - localStorage를 쓸 수 없는 환경(시크릿 모드 등)에서는 조용히 무시
 */
function createThrottledLocalStorage(delay: number): StateStorage {
  const pending = new Map<string, string>()
  let timeoutId: number | undefined

  const flush = () => {
    window.clearTimeout(timeoutId)
    timeoutId = undefined
    pending.forEach((value, key) => {
      try {
        localStorage.setItem(key, value)
      } catch {
        // 용량 초과 또는 저장소 차단 시 저장을 건너뜀
      }
    })
    pending.clear()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
  }

  return {
    getItem: (key) => {
      try {
        return pending.get(key) ?? localStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem: (key, value) => {
      pending.set(key, value)
      if (timeoutId === undefined) {
        timeoutId = window.setTimeout(flush, delay)
      }
    },
    removeItem: (key) => {
      pending.delete(key)
      try {
        localStorage.removeItem(key)
      } catch {
        // 저장소 차단 시 무시
      }
    },
  }
}

export const throttledStorage = createJSONStorage(() =>
  createThrottledLocalStorage(1000)
)
