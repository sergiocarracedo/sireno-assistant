import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "../../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500 text-white shadow hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
        outline:
          "border border-gray-200 bg-white shadow-sm hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900 dark:hover:text-gray-100",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
        ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        link: "text-blue-500 underline-offset-4 hover:underline dark:text-blue-400",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        xs: "h-7 rounded-md px-2 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-8 w-8",
        "xs-icon": "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, icon: Icon, iconPosition = 'left', children, ...props }, ref) => {
    // If asChild is used, render as before (for backward compatibility)
    if (props.asChild) {
      return (
        <button
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      )
    }

    // If icon is provided, enforce string children
    if (Icon && typeof children !== 'string' && children !== undefined) {
      console.error('Button with icon prop must have string children or no children')
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), Icon && 'gap-2')}
        ref={ref}
        {...props}
      >
        {Icon && iconPosition === 'left' && <Icon className="h-4 w-4 flex-shrink-0" />}
        {typeof children === 'string' ? <span>{children}</span> : children}
        {Icon && iconPosition === 'right' && <Icon className="h-4 w-4 flex-shrink-0" />}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
