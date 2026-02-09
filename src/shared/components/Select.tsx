import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Label } from '../../sidepanel/components/ui/label'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Simplified Select component
 * 
 * @example
 * <Select
 *   label="Choose a fruit"
 *   options={[
 *     { value: 'apple', label: 'Apple' },
 *     { value: 'banana', label: 'Banana' },
 *   ]}
 *   value={fruit}
 *   onChange={setFruit}
 * />
 */
export function Select({
  label,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select...',
  disabled,
  className,
}: SelectProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {label && <Label className="text-xs">{label}</Label>}
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          className={cn(
            'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md',
            'border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm',
            'ring-offset-white placeholder:text-gray-500',
            'focus:outline-none focus:ring-1 focus:ring-blue-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[&>span]:line-clamp-1',
            'dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100',
            'dark:ring-offset-gray-950 dark:placeholder:text-gray-400'
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md',
              'border border-gray-200 bg-white text-gray-950 shadow-md',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              'dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100'
            )}
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center',
                    'rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none',
                    'focus:bg-gray-100 focus:text-gray-900',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    'dark:focus:bg-gray-800 dark:focus:text-gray-100'
                  )}
                >
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
}
