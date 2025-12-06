import { RealtimeProgress } from './realtime-progress'
import { RevenueSummary } from './revenue-summary'
import { RankDistributionChart } from './rank-distribution-chart'
import { NumberFrequencyHeatmap } from './number-frequency-heatmap'
import { NumberHitFrequencyHeatmap } from './number-hit-frequency-heatmap'
import { RecommendedNumbersHeatmap } from './recommended-numbers-heatmap'

export function DashboardAnalytics() {
  return (
    <div className='space-y-4'>
      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <RealtimeProgress />
        </div>
        <RevenueSummary />
      </div>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <NumberFrequencyHeatmap />
        <NumberHitFrequencyHeatmap />
        <RecommendedNumbersHeatmap />
      </div>
      <div className='grid grid-cols-1 gap-4'>
        <RankDistributionChart />
      </div>
    </div>
  )
}
