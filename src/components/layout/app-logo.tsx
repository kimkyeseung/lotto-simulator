import { Link } from '@tanstack/react-router'

export function AppLogo() {
  return (
    <Link
      to='/'
      className='text-foreground flex items-center gap-2 text-base font-semibold tracking-tight'
    >
      <img
        src='/images/lotto-logo.svg'
        alt='Lotto Simulator'
        className='h-9 w-9 rounded-lg border border-white/20 shadow-sm dark:border-white/10'
      />
      <span className='hidden flex-col leading-tight sm:inline-flex'>
        <span className='text-muted-foreground text-xs uppercase'>Lotto</span>
        <span className='text-sm font-semibold'>Simulator</span>
      </span>
      <span className='inline-flex text-sm font-semibold sm:hidden'>Lotto</span>
    </Link>
  )
}
