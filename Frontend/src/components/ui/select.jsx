import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

function Select({ value, onValueChange, options = [], placeholder = 'Select', className, required = false }) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} required={required}>
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white',
          className,
        )}
        aria-label={placeholder}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm text-slate-900 outline-none data-[highlighted]:bg-slate-100"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex h-3.5 w-3.5 items-center justify-center">
                  <Check className="h-3.5 w-3.5" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export { Select }
