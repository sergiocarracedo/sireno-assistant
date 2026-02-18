import * as React from "react";
import { Checkbox as HeroCheckbox } from "@heroui/react";

import { cn } from "../../../lib/utils";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onCheckedChange, className, id, disabled, ...props }, ref) => (
    <HeroCheckbox
      ref={ref}
      isSelected={checked}
      onValueChange={onCheckedChange}
      isDisabled={disabled}
      id={id}
      className={cn("", className)}
      {...props}
    />
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
