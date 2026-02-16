import { cn } from '../../lib/utils'

function Label({ className, ...props }) {
  return <label className={cn('mb-1.5 block text-sm font-medium text-slate-900', className)} {...props} />
}

export { Label }
