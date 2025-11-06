import {
  LayoutDashboard,
  PlayCircle,
  BarChart3,
  Settings,
  Users,
  HelpCircle,
  Ticket,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '로또 매니저',
    email: 'manager@lottosim.dev',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Lotto Simulator',
      logo: Ticket,
      plan: '운영 중',
    },
  ],
  navGroups: [
    {
      title: '시뮬레이션',
      items: [
        {
          title: '대시보드',
          url: '/_authenticated/',
          icon: LayoutDashboard,
        },
        {
          title: '자동 구매',
          url: '/_authenticated/tasks',
          icon: PlayCircle,
        },
        {
          title: '통계 리포트',
          url: '/_authenticated/apps',
          icon: BarChart3,
        },
      ],
    },
    {
      title: '관리',
      items: [
        {
          title: '사용자 관리',
          url: '/_authenticated/users',
          icon: Users,
        },
        {
          title: '환경 설정',
          url: '/_authenticated/settings',
          icon: Settings,
        },
        {
          title: '도움말 센터',
          url: '/_authenticated/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
