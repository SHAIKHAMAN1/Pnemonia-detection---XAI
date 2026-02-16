import { cn } from '../../lib/utils'

function Badge({ className, tone = 'neutral', ...props }) {
  const tones = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  }

  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  )
}

export { Badge }
