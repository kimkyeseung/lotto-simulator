import { useResultStore } from '@/stores/result'
import { NumberBall } from '@/components/ui/number-ball'

export function LottoResult() {
  const { submittedTickets, winningNumbers } = useResultStore()

  return (
    <div className=''>
      <h5>당첨번호</h5>
      <div className='flex'>
        {winningNumbers &&
          winningNumbers.map((number) => (
            <NumberBall key={number}>{number}</NumberBall>
          ))}
      </div>

      <div className='space-y-2'>
        {submittedTickets.map((ticket, index) => (
          <div key={index} className='flex'>
            {ticket.map((number) => (
              <NumberBall>{number}</NumberBall>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
