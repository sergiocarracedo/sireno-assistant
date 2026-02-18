// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Switch as HeroSwitch } from "@heroui/react";

import { cn } from "../../../lib/utils";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
  title?: string;
}

const Switch = React.forwardRef<any, SwitchProps>(
  ({ checked, onCheckedChange, className, id, disabled, title, ...props }, ref) => (
    <HeroSwitch
      ref={ref}
      id={id}
      isSelected={checked}
      onValueChange={onCheckedChange}
      isDisabled={disabled}
      title={title}
      className={cn("", className)}
      {...props}
    >
      <HeroSwitch.Control>
        <HeroSwitch.Thumb />
      </HeroSwitch.Control>
    </HeroSwitch>
  ),
);
Switch.displayName = "Switch";

export { Switch };
