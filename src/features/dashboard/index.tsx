import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { KakaoAd } from '@/components/kakao-ad'
import { Charts } from './charts'
import { LottoResult } from './lotto-result'
import { Overview } from './overview'
import { RecentSales } from './recent-sales'
import { Statistics } from './statistics'

export function Dashboard() {
  const kakaoAdUnit = import.meta.env.VITE_KAKAO_AD_UNIT
  const kakaoAdWidth = import.meta.env.VITE_KAKAO_AD_WIDTH ?? '320'
  const kakaoAdHeight = import.meta.env.VITE_KAKAO_AD_HEIGHT ?? '100'

  return (
    <Main>
      <div className='mb-2 flex items-center justify-between space-y-2'>
        <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
      </div>
      <Tabs
        orientation='vertical'
        defaultValue='overview'
        className='space-y-4'
      >
        <div className='w-full overflow-x-auto pb-2'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='analytics'>Analytics</TabsTrigger>
            <TabsTrigger value='reports'>Reports</TabsTrigger>
            <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='overview' className='space-y-4'>
          <Card className='col-span-1 lg:col-span-4'>
            <CardHeader>
              <CardTitle>로또 구매하기 (5줄)</CardTitle>
            </CardHeader>
            <CardContent>
              <LottoTicketsForm />
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

            <Card className='lg:col-span-5'>
              <CardHeader>
                <CardTitle>빈칸</CardTitle>
              </CardHeader>
              <CardContent>
                {kakaoAdUnit ? (
                  <KakaoAd
                    unitId={kakaoAdUnit}
                    width={kakaoAdWidth}
                    height={kakaoAdHeight}
                  />
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    환경 변수에 Kakao 광고 정보를 입력하면 광고가 표시됩니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>차트</CardTitle>
            </CardHeader>
            <CardContent>
              <Charts />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Revenue
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='text-muted-foreground h-4 w-4'
                >
                  <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>$45,231.89</div>
                <p className='text-muted-foreground text-xs'>
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Subscriptions
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='text-muted-foreground h-4 w-4'
                >
                  <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                  <circle cx='9' cy='7' r='4' />
                  <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+2350</div>
                <p className='text-muted-foreground text-xs'>
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Sales</CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='text-muted-foreground h-4 w-4'
                >
                  <rect width='20' height='14' x='2' y='5' rx='2' />
                  <path d='M2 10h20' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+12,234</div>
                <p className='text-muted-foreground text-xs'>
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Active Now
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='text-muted-foreground h-4 w-4'
                >
                  <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+573</div>
                <p className='text-muted-foreground text-xs'>
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
          </div>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <Card className='col-span-1 lg:col-span-4'>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className='ps-2'>
                <Overview />
              </CardContent>
            </Card>
            <Card className='col-span-1 lg:col-span-3'>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  You made 265 sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Main>
  )
}
