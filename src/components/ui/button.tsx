import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-60";
    const variants: Record<string, string> = {
      default:
        "bg-emerald-500 text-neutral-950 hover:bg-emerald-400",
      ghost:
        "border border-neutral-800 bg-neutral-900/40 text-neutral-200 hover:bg-neutral-800/60",
    };

    const classes = [base, variants[variant], className].filter(Boolean).join(" ");

    return <button ref={ref} className={classes} {...props} />;
  }
);

Button.displayName = "Button";
