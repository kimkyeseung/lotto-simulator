import { useCallback, useState } from 'react'
import { type LottoFormSchema } from '@/schemas/lotto'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFormStore } from '@/stores/form'
import { cn } from '@/lib/utils'
import { LottoForm } from './lotto-form'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

export function MobileLottoSlipCarousel() {
  const { formData: tickets, updateForm } = useFormStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : tickets.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < tickets.length - 1 ? prev + 1 : 0))
  }

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  const handleFormChange = useCallback(
    (formData: LottoFormSchema) => {
      updateForm(currentIndex, formData)
    },
    [currentIndex, updateForm]
  )

  return (
    <Card className='w-full'>
      <CardContent className='space-y-4 p-4'>
        {/* Carousel Navigation */}
        <div className='flex items-center justify-between'>
          <Button
            variant='ghost'
            size='icon'
            onClick={goToPrevious}
            className='h-10 w-10'
          >
            <ChevronLeft className='h-5 w-5' />
          </Button>

          <div className='flex gap-2'>
            {tickets.map((t, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all',
                  index === currentIndex
                    ? 'scale-110 bg-amber-600 text-white shadow-lg'
                    : 'bg-muted text-muted-foreground hover:bg-amber-200'
                )}
              >
                {t.name}
              </button>
            ))}
          </div>

          <Button
            variant='ghost'
            size='icon'
            onClick={goToNext}
            className='h-10 w-10'
          >
            <ChevronRight className='h-5 w-5' />
          </Button>
        </div>

        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className='overflow-hidden'
        >
          <div
            className='flex transition-transform duration-300 ease-out'
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {tickets.map((t) => (
              <div key={t.name} className='w-full flex-shrink-0 px-1'>
                <LottoForm formName={t.name} onFormChange={handleFormChange} />
              </div>
            ))}
          </div>
        </div>

        {/* Swipe Indicator */}
        <div className='text-center'>
          <p className='text-muted-foreground text-xs'>
            좌우로 스와이프하여 다른 티켓 선택
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
