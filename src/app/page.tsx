"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { ArrowDownUp, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  expenseCategorySchema,
  type Expense,
  type ExpenseCreateInput,
} from "@/lib/schema";
import { getExpenseSummaryAction, getExpensesAction } from "./actions";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseTable } from "./components/ExpenseTable";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";

type ExpenseCategory = ExpenseCreateInput["category"];
type Filters = {
  category?: ExpenseCategory;
  sort: "date_desc" | "date_asc";
};

const categories = expenseCategorySchema.options;

export default function Home() {
  const [filters, setFilters] = useState<Filters>({ sort: "date_desc" });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState("0.00");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }),
    []
  );

  const totalDisplay = useMemo(
    () => currencyFormatter.format(Number(total || 0)),
    [currencyFormatter, total]
  );

  const fetchData = useCallback(async (activeFilters: Filters) => {
    setIsLoading(true);
    setErrorMessage(null);
    const [expensesResult, summaryResult] = await Promise.all([
      getExpensesAction({
        category: activeFilters.category,
        sort: activeFilters.sort,
      }),
      getExpenseSummaryAction({ category: activeFilters.category }),
    ]);

    if (!expensesResult.success) {
      toast.error(expensesResult.error);
      setExpenses([]);
      setErrorMessage(expensesResult.error);
    } else {
      setExpenses(expensesResult.data);
    }

    if (!summaryResult.success) {
      toast.error(summaryResult.error);
      setTotal("0.00");
      setErrorMessage(summaryResult.error);
    } else {
      setTotal(summaryResult.data.total);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    startTransition(() => {
      void fetchData(filters);
    });
  }, [fetchData, filters]);

  const handleCreated = useCallback(() => {
    startTransition(() => {
      void fetchData(filters);
    });
  }, [fetchData, filters]);

  const handleCategoryChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      category: value ? (value as ExpenseCategory) : undefined,
    }));
  }, []);

  const toggleSort = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      sort: prev.sort === "date_desc" ? "date_asc" : "date_desc",
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({ sort: prev.sort }));
  }, []);

  const handleRetry = useCallback(() => {
    startTransition(() => {
      void fetchData(filters);
    });
  }, [fetchData, filters]);

  const isBusy = isLoading || isPending;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 space-y-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            Reliable Expense Operations
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-100">
            Expense Tracker
          </h1>
          <p className="text-neutral-400">
            Track spending, filter by category, and monitor totals in real time.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1.95fr]">
          <ExpenseForm onCreated={handleCreated} />

          <div className="space-y-5">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <Wallet size={18} className="text-emerald-300" />
                Total Expenses
              </div>
              <div className="mt-3 text-3xl font-semibold text-neutral-100">
                {isBusy ? (
                  <span className="inline-flex h-9 w-40 animate-pulse rounded-lg bg-neutral-800" />
                ) : (
                  totalDisplay
                )}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Reflects the currently applied filters.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
              <Select
                value={filters.category ?? ""}
                onValueChange={handleCategoryChange}
                className="min-w-45"
              >
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0) + category.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </Select>
              <Button
                type="button"
                variant="ghost"
                onClick={toggleSort}
                className="gap-2"
              >
                <ArrowDownUp size={16} />
                Sort by {filters.sort === "date_desc" ? "Newest" : "Oldest"}
              </Button>
              {isBusy && (
                <span className="text-xs text-neutral-500">Updating...</span>
              )}
            </div>
            {errorMessage && !isBusy && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>{errorMessage}</span>
                  <Button type="button" variant="ghost" onClick={handleRetry}>
                    Retry
                  </Button>
                </div>
              </div>
            )}

            <ExpenseTable
              expenses={expenses}
              isLoading={isBusy}
              emptyActionLabel={filters.category ? "Clear filters" : undefined}
              onEmptyAction={filters.category ? clearFilters : undefined}
              emptyHint={
                filters.category
                  ? "No expenses match this category yet."
                  : "Add a new expense to see it here."
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}