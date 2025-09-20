import { cn } from '@/lib/utils'

interface Props {
  children: number
  isDeactivated?: boolean
  isSmall?: boolean
}

export function NumberBall({ children, isDeactivated, isSmall }: Props) {
  const color =
    children <= 10
      ? 'bg-chart-1'
      : children <= 20
        ? 'bg-chart-2'
        : children <= 30
          ? 'bg-chart-3'
          : children <= 40
            ? 'bg-chart-4'
            : 'bg-chart-5'
  return (
    <div
      className={cn(
        isDeactivated ? 'bg-muted text-gray-400' : [color, 'text-white'],
        'flex items-center justify-center rounded-full',
        isSmall ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm'
      )}
    >
      {children}
    </div>
  )
}
