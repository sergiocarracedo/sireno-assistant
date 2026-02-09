import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "../../../lib/utils"

const buttonLinkVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300 disabled:pointer-events-none disabled:opacity-50 no-underline",
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
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonLinkVariants> {
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
}

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant, size, icon: Icon, iconPosition = 'left', children, ...props }, ref) => {
    // Enforce that children must be a string
    if (typeof children !== 'string') {
      console.error('ButtonLink children must be a string')
      return null
    }

    return (
      <a
        className={cn(buttonLinkVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {Icon && iconPosition === 'left' && <Icon className="h-4 w-4 flex-shrink-0" />}
        <span>{children}</span>
        {Icon && iconPosition === 'right' && <Icon className="h-4 w-4 flex-shrink-0" />}
      </a>
    )
  }
)
ButtonLink.displayName = "ButtonLink"

export { ButtonLink, buttonLinkVariants }
