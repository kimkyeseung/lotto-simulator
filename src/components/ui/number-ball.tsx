import { cn } from '@/lib/utils'

interface Props {
  children: number
}

export function NumberBall({ children }: Props) {
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
        color,
        'flex items-center justify-center rounded-full lg:h-8 lg:w-8 text-white'
      )}
    >
      {children}
    </div>
  )
}
