import { useLotto } from '@/hooks/use-lotto'

export function AutoPurchaseRunner() {
  useLotto({ enableAutoRunner: true })
  return null
}
