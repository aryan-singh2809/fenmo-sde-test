import { Receipt } from "lucide-react";
import type { Expense } from "@/lib/schema";

type ExpenseTableProps = {
  expenses: Expense[];
  isLoading?: boolean;
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

export function ExpenseTable({ expenses, isLoading }: ExpenseTableProps) {
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
            Add a new expense to see it here.
          </p>
        </div>
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
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {expenses.map((expense) => (
            <tr key={expense.id} className="text-neutral-300">
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
