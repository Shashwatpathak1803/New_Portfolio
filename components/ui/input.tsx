import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl bg-surface/90 border border-ink/10 px-4 py-2 text-sm text-ink font-body shadow-sm",
          "placeholder:text-muted/60 transition-all duration-300",
          "focus:border-accent focus:ring-2 focus:ring-accent/25 focus:bg-surface focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
