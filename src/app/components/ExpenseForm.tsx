"use client";

import { useEffect, useId } from "react";
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

  useEffect(() => {
    const key = createIdempotencyKey();
    form.setValue("idempotencyKey", key, {
      shouldDirty: false,
      shouldValidate: false,
      shouldTouch: false,
    });
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await createExpenseAction(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Expense saved");
    const nextKey = createIdempotencyKey();

    form.reset({
      idempotencyKey: nextKey,
      amount: "",
      date: getToday(),
      category: values.category,
      description: "",
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
        <Input
          placeholder="Coffee with the team"
          {...form.register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-400">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-400">Amount</label>
          <Input
            placeholder="0.00"
            inputMode="decimal"
            autoComplete="off"
            {...form.register("amount")}
          />
          {errors.amount && (
            <p className="text-xs text-red-400">{errors.amount.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-400">Date</label>
          <Input type="date" autoComplete="off" {...form.register("date")} />
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
