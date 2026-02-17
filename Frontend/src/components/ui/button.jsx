import { cn } from '../../lib/utils'

function Button({ className, variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700 border-sky-600',
    secondary: 'bg-white text-slate-900 hover:bg-slate-50 border-slate-300',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border-transparent',
  }

  return (
    <button
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Button }
