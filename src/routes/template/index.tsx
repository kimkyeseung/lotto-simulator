import { createFileRoute } from '@tanstack/react-router'
import { type WinningRank } from '@/types/lotto'
import { toast } from 'sonner'
import { useConfigStore } from '@/stores/config'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { FancyToaster } from '@/components/fancy-toaster'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createFileRoute('/template/')({
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

      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>당첨 토스트</h2>
        <div className='flex items-center gap-4'>
          {ranks.map(({ rank, prize }) => (
            <Button
              onClick={() => {
                toast.custom(() => <FancyToaster rank={rank} prize={prize} />)
              }}
            >
              {rank}등
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
