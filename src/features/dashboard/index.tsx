import { Suspense, lazy, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useResultStore } from '@/stores/result'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LottoTicketsForm } from '@/components/lotto-ticket-form'
import { MobileControlPanel } from '@/components/mobile-control-panel'
import { MobileKakaoAd } from '@/components/mobile-kakao-ad'
import { MobileLottoSlipCarousel } from '@/components/mobile-lotto-slip-carousel'
import { ThemeSwitch } from '@/components/theme-switch'
import { AutoPurchaseRunner } from './auto-purchase-runner'
import { LottoResult } from './lotto-result'
import { LuckyNumbers } from './lucky-numbers'
import { Statistics } from './statistics'
import { HistoryLog } from './history-log'
import { Skeleton } from '@/components/ui/skeleton'

const LazyDashboardAnalytics = lazy(() =>
  import('./analytics').then((module) => ({ default: module.DashboardAnalytics }))
)

const LazyCharts = lazy(() =>
  import('./charts').then((module) => ({ default: module.Charts }))
)

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const { isMobile } = useSidebar()
  const { usedMoney, totalPrize, submittedCount } = useResultStore(
    useShallow((state) => ({
      usedMoney: state.usedMoney,
      totalPrize: state.totalPrize,
      submittedCount: state.submittedCount,
    }))
  )
  const netProfit = totalPrize - usedMoney
  const profitRate =
    usedMoney === 0 ? 0 : ((totalPrize - usedMoney) / usedMoney) * 100
  const profitRateAccent =
    profitRate >= 0 ? 'text-emerald-500' : 'text-destructive'
  const netProfitAccent =
    netProfit >= 0 ? 'text-emerald-500' : 'text-destructive'
  const formattedNetProfit = `${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()} 원`
  const formattedProfitRate = `${profitRate >= 0 ? '+' : ''}${profitRate.toFixed(2)}%`
  const headerOffsetClass = isMobile ? 'mt-[120px]' : undefined


  return (
    <>
      <AutoPurchaseRunner />
      {isMobile && <MobileKakaoAd />}
      <Header
        fixed
        className={cn(
          'bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur',
          headerOffsetClass
        )}
      >
        <div className='flex flex-1 flex-wrap items-center gap-4'>
          <div className='space-y-1'>
            <p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
              Lotto Simulator
            </p>
            <h1 className='text-lg leading-tight font-semibold'>
              로또 시뮬레이터
            </h1>
          </div>
          <div className='ms-auto flex items-center gap-3'>
            <div className='hidden items-center gap-3 rounded-md border px-3 py-1.5 text-xs sm:flex'>
              <div className='grid gap-0.5'>
                <span className='text-muted-foreground'>회차</span>
                <span className='font-semibold tabular-nums'>
                  {submittedCount.toLocaleString()} 회
                </span>
              </div>
              <Separator orientation='vertical' className='h-6' />
              <div className='grid gap-0.5'>
                <span className='text-muted-foreground'>누적 수익</span>
                <span
                  className={cn('font-semibold tabular-nums', netProfitAccent)}
                >
                  {formattedNetProfit}
                </span>
              </div>
              <Separator orientation='vertical' className='h-6' />
              <div className='grid gap-0.5'>
                <span className='text-muted-foreground'>수익률</span>
                <span
                  className={cn('font-semibold tabular-nums', profitRateAccent)}
                >
                  {formattedProfitRate}
                </span>
              </div>
            </div>
            <ThemeSwitch />
          </div>
        </div>
      </Header>
      {/* 모바일일 때 하단 컨트롤 패널 공간 확보 */}
      <Main className={isMobile ? 'mb-24' : undefined}>
        <Tabs
          orientation='vertical'
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='analytics'>Analytics</TabsTrigger>
              <TabsTrigger value='log'>Log</TabsTrigger>
              <TabsTrigger value='notifications'>Notifications</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <Card className='col-span-1 lg:col-span-4'>
              <CardHeader>
                <CardTitle>로또 구매하기 (5줄)</CardTitle>
              </CardHeader>
              <CardContent>
                {isMobile ? <MobileLottoSlipCarousel /> : <LottoTicketsForm />}
              </CardContent>
            </Card>

            <div className='grid gap-4 sm:grid-cols-1 lg:grid-cols-12'>
              <Card className='lg:col-span-4'>
                <CardHeader>
                  <CardTitle>당첨 결과</CardTitle>
                </CardHeader>

                <CardContent>
                  <LottoResult />
                </CardContent>
              </Card>

              <Card className='lg:col-span-3'>
                <CardHeader>
                  <CardTitle>통계</CardTitle>
                </CardHeader>

                <CardContent>
                  <Statistics />
                </CardContent>
              </Card>

              {!isMobile && (
                <Card className='lg:col-span-5'>
                  <CardHeader>
                    <CardTitle>추천 번호</CardTitle>
                    <CardDescription>
                      시뮬레이션 통계 기반 분석
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LuckyNumbers />
                  </CardContent>
                </Card>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>차트</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartsFallback />}>
                  <LazyCharts />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='analytics' className='space-y-4'>
            <Suspense fallback={<AnalyticsFallback />}>
              {activeTab === 'analytics' ? (
                <LazyDashboardAnalytics />
              ) : (
                <AnalyticsFallback />
              )}
            </Suspense>
          </TabsContent>

          <TabsContent value='log' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>시뮬레이션 히스토리</CardTitle>
                <CardDescription>
                  각 회차별 시뮬레이션 결과 로그
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HistoryLog />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
      {isMobile && <MobileControlPanel />}
    </>
  )
}

function ChartsFallback() {
  return <Skeleton className='h-[240px] w-full' />
}

function AnalyticsFallback() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-[280px] w-full' />
      <Skeleton className='h-[280px] w-full' />
      <Skeleton className='h-[280px] w-full' />
    </div>
  )
}
