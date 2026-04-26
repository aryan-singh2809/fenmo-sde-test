import * as React from "react";

type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "value"
> & {
  value?: string;
  onValueChange?: (value: string) => void;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    const base =
      "h-11 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-sm text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60";
    const classes = [base, className].filter(Boolean).join(" ");

    return (
      <select
        ref={ref}
        value={value ?? ""}
        onChange={(event) => onValueChange?.(event.target.value)}
        className={classes}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

type SelectItemProps = React.OptionHTMLAttributes<HTMLOptionElement>;

export function SelectItem({ className, ...props }: SelectItemProps) {
  const classes = ["text-neutral-900", className].filter(Boolean).join(" ");
  return <option className={classes} {...props} />;
}
