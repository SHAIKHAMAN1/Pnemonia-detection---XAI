import { cn } from '../../lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return <div className={cn('space-y-1.5 p-6 pb-4', className)} {...props} />
}

function CardTitle({ className, ...props }) {
  return <h2 className={cn('text-xl font-semibold text-slate-900', className)} {...props} />
}

function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-slate-500', className)} {...props} />
}

function CardContent({ className, ...props }) {
  return <div className={cn('space-y-4 px-6 pb-6', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
