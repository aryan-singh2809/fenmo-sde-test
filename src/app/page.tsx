import { auth } from "@/auth";
import { Dashboard } from "@/app/components/Dashboard";
import { getExpensesAction, getExpenseSummaryAction } from "@/app/actions";

export default async function Home() {
  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      }
    : null;

  // Pre-fetch initial data for SSR to prevent loading flash
  const [expensesResult, summaryResult] = await Promise.all([
    getExpensesAction({ sort: "date_desc", page: 1, limit: 10 }),
    getExpenseSummaryAction({}),
  ]);

  const initialExpensesData = expensesResult.success
    ? expensesResult.data
    : { expenses: [], totalCount: 0 };
  const initialTotal = summaryResult.success ? summaryResult.data.total : "0.00";

  return (
    <Dashboard
      user={user}
      initialExpensesData={initialExpensesData}
      initialTotal={initialTotal}
    />
  );
}