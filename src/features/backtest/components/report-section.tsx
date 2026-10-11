type ReportSectionProps = {
  step: number
  title: string
  description: string
  children: React.ReactNode
}

export function ReportSection({
  step,
  title,
  description,
  children,
}: ReportSectionProps) {
  return (
    <section className='space-y-3'>
      <div className='flex items-start gap-3'>
        <span className='bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold'>
          {step}
        </span>
        <div>
          <h2 className='text-lg leading-7 font-semibold'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

export function StatTile({
  label,
  value,
  hint,
  valueClassName,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className='bg-card space-y-1 rounded-xl border p-4'>
      <p className='text-muted-foreground text-sm'>{label}</p>
      <p
        className={`text-xl font-semibold tabular-nums sm:text-2xl ${valueClassName ?? ''}`}
      >
        {value}
      </p>
      {hint && <p className='text-muted-foreground text-xs'>{hint}</p>}
    </div>
  )
}
