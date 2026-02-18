// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Slider as HeroSlider } from "@heroui/react";

import { cn } from "../../../lib/utils";

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  id?: string;
}

const Slider = React.forwardRef<any, SliderProps>(
  ({ value, onValueChange, min = 0, max = 100, step = 1, className, id, ...props }, ref) => (
    <HeroSlider
      ref={ref}
      id={id}
      value={value}
      onChange={(val: any) => onValueChange?.(Array.isArray(val) ? val : [val])}
      minValue={min}
      maxValue={max}
      step={step}
      className={cn("", className)}
      {...props}
    >
      <HeroSlider.Track>
        <HeroSlider.Fill />
        <HeroSlider.Thumb />
      </HeroSlider.Track>
    </HeroSlider>
  ),
);
Slider.displayName = "Slider";

export { Slider };
