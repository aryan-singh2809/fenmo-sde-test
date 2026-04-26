"use client";

import { useState, useTransition } from "react";
import { Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Expense } from "@/lib/schema";
import { deleteExpenseAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

type ExpenseTableProps = {
  expenses: Expense[];
  isLoading?: boolean;
  emptyHint?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onDeleted?: () => void;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

const formatAmount = (amount: string) =>
  currencyFormatter.format(Number(amount || 0));

const formatDate = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  return dateFormatter.format(date);
};

function DeleteButton({
  expenseId,
  onDeleted,
}: {
  expenseId: string;
  onDeleted?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    startTransition(async () => {
      const result = await deleteExpenseAction(expenseId);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("Expense deleted");
        onDeleted?.();
      }
      setConfirming(false);
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className={`inline-flex items-center justify-center rounded-lg p-1.5 transition-colors ${
        confirming
          ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
          : "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
      } disabled:opacity-50`}
      title={confirming ? "Click again to confirm" : "Delete expense"}
    >
      {isPending ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Trash2 size={15} />
      )}
    </button>
  );
}

export function ExpenseTable({
  expenses,
  isLoading,
  emptyHint,
  emptyActionLabel,
  onEmptyAction,
  onDeleted,
}: ExpenseTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
        {[...Array(4)].map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="h-10 w-full animate-pulse rounded-lg bg-neutral-800"
          />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900/70 text-neutral-500">
          <Receipt size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-200">
            No expenses found
          </p>
          <p className="text-xs text-neutral-500">
            {emptyHint ?? "Add a new expense to see it here."}
          </p>
        </div>
        {emptyActionLabel && onEmptyAction && (
          <Button type="button" variant="ghost" onClick={onEmptyAction}>
            {emptyActionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-900/80 text-xs uppercase tracking-wider text-neutral-500">
          <tr>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="w-12 px-2 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {expenses.map((expense) => (
            <tr key={expense.id} className="group text-neutral-300">
              <td className="px-4 py-3 font-medium text-neutral-100">
                {expense.description}
              </td>
              <td className="px-4 py-3">
                {expense.category.charAt(0) +
                  expense.category.slice(1).toLowerCase()}
              </td>
              <td className="px-4 py-3">{formatDate(expense.date)}</td>
              <td className="px-4 py-3 text-right font-semibold text-emerald-300">
                {formatAmount(expense.amount)}
              </td>
              <td className="px-2 py-3 text-center opacity-0 transition-opacity group-hover:opacity-100">
                <DeleteButton expenseId={expense.id} onDeleted={onDeleted} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
