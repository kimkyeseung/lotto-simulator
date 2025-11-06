import { createFileRoute } from '@tanstack/react-router'
import { buildSeo } from '@/utils/seo'
import { type WinningRank } from '@/types/lotto'
import { toast } from 'sonner'
import { useConfigStore } from '@/stores/config'
import { generateLottoNumbers } from '@/lib/lotto'
import { Button } from '@/components/ui/button'
import { NumberBall } from '@/components/ui/number-ball'
import { ConfigDrawer } from '@/components/config-drawer'
import { CustomToaster } from '@/components/custom-toaster'
import { FancyToaster } from '@/components/fancy-toaster'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createFileRoute('/template/')({
  head: () =>
    buildSeo({
      title: 'UI 컴포넌트 미리보기 | Lotto Simulator',
      description: '로또 관련 UI 컴포넌트를 확인하고 데모 동작을 테스트하는 템플릿 페이지입니다.',
      path: '/template/',
      noIndex: true,
    }),
  component: TemplateIndex,
})

const topNav = [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Customers',
    href: 'dashboard/customers',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Products',
    href: 'dashboard/products',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Settings',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
]

function TemplateIndex() {
  const arbitaryNumbers = generateLottoNumbers({ isContainBonusNumber: false })
  const { prizeMap } = useConfigStore.getState()

  const ranks: { rank: WinningRank; prize: number }[] = [
    { rank: 1, prize: prizeMap[1] },
    { rank: 2, prize: prizeMap[2] },
    { rank: 3, prize: prizeMap[2] },
    { rank: 4, prize: prizeMap[2] },
    { rank: 5, prize: prizeMap[2] },
  ]

  return (
    <div className='p-2'>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>당첨 토스트</h2>
          <div className='flex items-center gap-4'>
            {ranks.map(({ rank, prize }) => (
              <Button
                onClick={() => {
                  if ([1, 2, 3].includes(rank)) {
                    toast.custom(() => (
                      <FancyToaster
                        rank={rank}
                        prize={prize}
                        numbers={arbitaryNumbers}
                      />
                    ))
                  } else {
                    toast.custom(() => (
                      <CustomToaster
                        numbers={arbitaryNumbers}
                        rank={rank}
                        prize={prize}
                      />
                    ))
                  }
                }}
              >
                {rank}등
              </Button>
            ))}
          </div>
        </div>

        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>넘버볼</h2>

          <div className='flex max-w-118 flex-wrap items-center gap-4'>
            {Array.from({ length: 45 }, (_, i) => i + 1).map((number) => (
              <div key={number}>
                <NumberBall key={number}>{number}</NumberBall>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
