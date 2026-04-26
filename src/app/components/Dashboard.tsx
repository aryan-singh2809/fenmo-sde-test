"use client";

import { useCallback, useEffect, useMemo, useState, useTransition, useRef } from "react";
import { ArrowDownUp, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  expenseCategorySchema,
  type Expense,
  type ExpenseCreateInput,
} from "@/lib/schema";
import { getExpenseSummaryAction, getExpensesAction, signOutAction } from "@/app/actions";
import { ExpenseForm } from "@/app/components/ExpenseForm";
import { ExpenseTable } from "@/app/components/ExpenseTable";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";

type ExpenseCategory = ExpenseCreateInput["category"];
type Filters = {
  category?: ExpenseCategory;
  sort: "date_desc" | "date_asc";
  page: number;
};

type DashboardProps = {
  user: { name: string | null; email: string | null } | null;
  initialExpensesData: { expenses: Expense[]; totalCount: number };
  initialTotal: string;
};

const categories = expenseCategorySchema.options;
const LIMIT = 10;

export function Dashboard({ user, initialExpensesData, initialTotal }: DashboardProps) {
  const [filters, setFilters] = useState<Filters>({ sort: "date_desc", page: 1 });
  const [expenses, setExpenses] = useState<Expense[]>(initialExpensesData.expenses);
  const [totalCount, setTotalCount] = useState(initialExpensesData.totalCount);
  const [total, setTotal] = useState(initialTotal);
  
  // Start loading as false because we have SSR initial data
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initialLoadRef = useRef(true);

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }),
    []
  );

  const totalDisplay = useMemo(
    () => currencyFormatter.format(Number(total || 0)),
    [currencyFormatter, total]
  );
  
  const totalPages = Math.ceil(totalCount / LIMIT) || 1;

  const fetchData = useCallback(async (activeFilters: Filters) => {
    setIsLoading(true);
    setErrorMessage(null);
    const [expensesResult, summaryResult] = await Promise.all([
      getExpensesAction({
        category: activeFilters.category,
        sort: activeFilters.sort,
        page: activeFilters.page,
        limit: LIMIT,
      }),
      getExpenseSummaryAction({ category: activeFilters.category }),
    ]);

    if (!expensesResult.success) {
      toast.error(expensesResult.error);
      setExpenses([]);
      setTotalCount(0);
      setErrorMessage(expensesResult.error);
    } else {
      setExpenses(expensesResult.data.expenses);
      setTotalCount(expensesResult.data.totalCount);
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
    // Skip fetching on initial mount since we use SSR pre-fetched data
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    startTransition(() => {
      void fetchData(filters);
    });
  }, [fetchData, filters]);

  const handleCreated = useCallback(() => {
    // When a new expense is created/deleted, force fetch the first page for fresh data
    setFilters((prev) => ({ ...prev, page: 1 }));
    startTransition(() => {
      void fetchData({ ...filters, page: 1 });
    });
  }, [fetchData, filters]);

  const handleCategoryChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      category: value ? (value as ExpenseCategory) : undefined,
      page: 1, // reset page on filter change
    }));
  }, []);

  const toggleSort = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      sort: prev.sort === "date_desc" ? "date_asc" : "date_desc",
      page: 1, // reset page on sort change
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({ sort: prev.sort, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
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
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Reliable Expense Operations
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-100">
              Expense Tracker
            </h1>
            <p className="text-neutral-400">
              Track spending, filter by category, and monitor totals in real time.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 px-4 py-3">
            <div className="text-right">
              <p className="text-xs text-neutral-500">Signed in as</p>
              <p className="text-sm font-semibold text-neutral-100">
                {user?.name || user?.email || "User"}
              </p>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost">
                Sign Out
              </Button>
            </form>
          </div>
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

            <div className="space-y-3">
              <ExpenseTable
                expenses={expenses}
                isLoading={isBusy && expenses.length === 0}
                emptyActionLabel={filters.category ? "Clear filters" : undefined}
                onEmptyAction={filters.category ? clearFilters : undefined}
                onDeleted={handleCreated}
                emptyHint={
                  filters.category
                    ? "No expenses match this category yet."
                    : "Add a new expense to see it here."
                }
              />

              {totalCount > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-400">
                  <span>
                    Showing {(filters.page - 1) * LIMIT + 1} to{" "}
                    {Math.min(filters.page * LIMIT, totalCount)} of {totalCount}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1 || isBusy}
                      className="px-2"
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="font-medium text-neutral-300">
                      Page {filters.page} of {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === totalPages || isBusy}
                      className="px-2"
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
