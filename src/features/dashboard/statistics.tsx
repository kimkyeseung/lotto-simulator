import { useResultStore } from '@/stores/result'

export function Statistics() {
  const { usedMoney, totalPrize, submittedCount } = useResultStore()
  return (
    <div className='space-y-4'>
      <div className='flex flex-1 flex-wrap items-center justify-between'>
        <p className='text-sm leading-none font-medium'>회차</p>
        <div className='font-medium'>{submittedCount} 회</div>
      </div>
      <div className='flex flex-1 flex-wrap items-center justify-between'>
        <p className='text-sm leading-none font-medium'>누적 사용금액</p>
        <div className='font-medium'>{usedMoney.toLocaleString()} 원</div>
      </div>
      <div className='flex flex-1 flex-wrap items-center justify-between'>
        <p className='text-sm leading-none font-medium'>누적 상금</p>
        <div className='font-medium'>{totalPrize.toLocaleString()} 원</div>
      </div>
    </div>
  )
}
