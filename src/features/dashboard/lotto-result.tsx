import { useResultStore } from '@/stores/result'
import { checkLottoResult } from '@/lib/lotto'
import { Card, CardContent } from '@/components/ui/card'
import { NumberBall } from '@/components/ui/number-ball'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

const formNameMap = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E',
}

export function LottoResult() {
  const { submittedTickets, winningNumbers } = useResultStore()

  return (
    <div className='space-y-3'>
      <h5>당첨번호</h5>
      <Card className='py-3'>
        <CardContent className='flex justify-center gap-3 px-3'>
          {winningNumbers &&
            winningNumbers
              .slice(0, 6)
              .map((number) => <NumberBall key={number}>{number}</NumberBall>)}
          {winningNumbers && (
            <div className='flex items-center'>
              <span className='mx-1'>+</span>
              <NumberBall>{winningNumbers[6]}</NumberBall>
            </div>
          )}
        </CardContent>
      </Card>

      <Table>
        <TableBody>
          {submittedTickets.map((ticket, index) => (
            <TableRow key={index}>
              <TableCell>
                {formNameMap[index as keyof typeof formNameMap]}
              </TableCell>
              <TableCell>
                {winningNumbers &&
                  checkLottoResult(ticket, winningNumbers).message}
              </TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  {ticket.map((number) => (
                    <NumberBall
                      key={number}
                      isDeactivated={!winningNumbers?.includes(number)}
                    >
                      {number}
                    </NumberBall>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
