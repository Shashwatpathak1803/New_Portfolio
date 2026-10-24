import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[140px] w-full rounded-xl bg-surface/90 border border-ink/10 px-4 py-3 text-sm text-ink font-body shadow-sm",
          "placeholder:text-muted/60 transition-all duration-300 resize-none",
          "focus:border-accent focus:ring-2 focus:ring-accent/25 focus:bg-surface focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
