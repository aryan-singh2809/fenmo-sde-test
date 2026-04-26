"use client";

import { useCallback, useEffect, useId } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import {
  expenseCategorySchema,
  expenseCreateSchema,
  type ExpenseCreateInput,
} from "@/lib/schema";
import { createExpenseAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type ExpenseFormProps = {
  onCreated?: () => void;
};

const categories = expenseCategorySchema.options;

const getToday = () => new Date().toISOString().slice(0, 10);

const createIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function ExpenseForm({ onCreated }: ExpenseFormProps) {
  const headerId = useId();

  const form = useForm<ExpenseCreateInput>({
    resolver: zodResolver(expenseCreateSchema, undefined, { raw: true }),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      idempotencyKey: "",
      amount: "",
      date: getToday(),
      category: "FOOD",
      description: "",
    },
  });

  const { isSubmitting, errors } = form.formState;

  const rotateIdempotencyKey = useCallback(() => {
    const key = createIdempotencyKey();
    form.setValue("idempotencyKey", key, {
      shouldDirty: false,
      shouldValidate: false,
      shouldTouch: false,
    });
    return key;
  }, [form]);

  useEffect(() => {
    rotateIdempotencyKey();
  }, [rotateIdempotencyKey]);

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await createExpenseAction(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Expense saved");
    form.reset({
      idempotencyKey: rotateIdempotencyKey(),
      amount: "",
      date: getToday(),
      category: values.category,
      description: "",
    }, {
      keepErrors: false,
      keepDirty: false,
      keepTouched: false,
    });

    onCreated?.();
  });

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6"
      aria-labelledby={headerId}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
          <ClipboardCheck size={18} />
        </div>
        <div>
          <h2 id={headerId} className="text-lg font-semibold text-neutral-100">
            New Expense
          </h2>
          <p className="text-xs text-neutral-500">
            Idempotent submissions prevent duplicates.
          </p>
        </div>
      </div>

      <input type="hidden" {...form.register("idempotencyKey")} />

      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-400">Description</label>
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <Input
              placeholder="Coffee with the team"
              value={field.value ?? ""}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        {errors.description && (
          <p className="text-xs text-red-400">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-400">Amount</label>
          <Controller
            control={form.control}
            name="amount"
            render={({ field }) => (
              <Input
                placeholder="0.00"
                inputMode="decimal"
                autoComplete="off"
                value={field.value ?? ""}
                onChange={(event) =>
                  field.onChange(event.target.value.replace(",", "."))
                }
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
          {errors.amount && (
            <p className="text-xs text-red-400">{errors.amount.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-400">Date</label>
          <Controller
            control={form.control}
            name="date"
            render={({ field }) => (
              <Input
                type="date"
                autoComplete="off"
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
          {errors.date && (
            <p className="text-xs text-red-400">{errors.date.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-400">Category</label>
        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-xs text-red-400">{errors.category.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Save Expense"}
      </Button>
    </form>
  );
}
