import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    const base =
      "h-11 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60";
    const classes = [base, className].filter(Boolean).join(" ");

    return <input ref={ref} type={type} className={classes} {...props} />;
  }
);

Input.displayName = "Input";
