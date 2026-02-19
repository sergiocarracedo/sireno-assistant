// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Select as HeroSelect, SelectItem } from "@heroui/react";
import { cn } from "../../lib/utils";
import { Label } from "./ui/label";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  badge?: string;
  badgeColor?: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const Select = React.forwardRef<any, SelectProps>(
  (
    {
      label,
      options,
      value,
      defaultValue,
      onChange,
      placeholder = "Select...",
      disabled,
      className,
    },
    _ref,
  ) => {
    const handleChange = (keys: any) => {
      const key = typeof keys === "string" ? keys : Array.from(keys)[0];
      onChange?.(key as string);
    };

    return (
      <div className={cn("space-y-1", className)}>
        {label && <Label className="text-xs">{label}</Label>}
        <HeroSelect
          selectedKeys={value ? [value] : defaultValue ? [defaultValue] : []}
          onSelectionChange={handleChange}
          isDisabled={disabled}
          placeholder={placeholder}
          aria-label={label || placeholder}
        >
          {options.map((option) => (
            <SelectItem key={option.value} isDisabled={option.disabled} textValue={option.label}>
              <div className="flex items-center gap-2">
                {option.label}
                {option.badge && (
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full font-medium",
                      option.badgeColor ||
                        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
                    )}
                  >
                    {option.badge}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </HeroSelect>
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
