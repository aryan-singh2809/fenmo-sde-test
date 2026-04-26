"use server";

import { Prisma, type Expense as DbExpense } from "@prisma/client";
import { db } from "@/lib/db";
import {
  expenseCreateSchema,
  type Expense,
  type ExpenseCreate,
  type ExpenseCreateInput,
} from "@/lib/schema";

type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type ExpenseCategory = ExpenseCreateInput["category"];

const serializeExpense = (expense: DbExpense): Expense => ({
  id: expense.id,
  idempotencyKey: expense.idempotencyKey,
  amount: expense.amount.toString(),
  date: expense.date,
  category: expense.category,
  description: expense.description,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
});

const formatZodError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Invalid input";
};

export async function createExpenseAction(
  data: ExpenseCreateInput
): Promise<ActionResponse<Expense>> {
  const parsed = expenseCreateSchema.safeParse(data);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("; ");
    return { success: false, error: message };
  }

  const input: ExpenseCreate = parsed.data;

  const existing = await db.expense.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });

  if (existing) {
    return { success: true, data: serializeExpense(existing) };
  }

  try {
    const created = await db.expense.create({
      data: {
        idempotencyKey: input.idempotencyKey,
        amount: new Prisma.Decimal(input.amount),
        date: input.date,
        category: input.category,
        description: input.description,
      },
    });

    return { success: true, data: serializeExpense(created) };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const duplicate = await db.expense.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });

      if (duplicate) {
        return { success: true, data: serializeExpense(duplicate) };
      }

      return { success: false, error: "Duplicate idempotency key" };
    }

    return { success: false, error: formatZodError(error) };
  }
}

export async function getExpensesAction(filters: {
  category?: ExpenseCategory;
  sort?: "date_desc" | "date_asc";
}): Promise<ActionResponse<Expense[]>> {
  try {
    const where = filters.category ? { category: filters.category } : {};
    const orderBy = {
      date: filters.sort === "date_asc" ? "asc" : "desc",
    } as const;

    const expenses = await db.expense.findMany({
      where,
      orderBy,
    });

    return { success: true, data: expenses.map(serializeExpense) };
  } catch (error) {
    return { success: false, error: formatZodError(error) };
  }
}

export async function getExpenseSummaryAction(filters: {
  category?: ExpenseCategory;
}): Promise<ActionResponse<{ total: string }>> {
  try {
    const where = filters.category ? { category: filters.category } : {};

    const summary = await db.expense.aggregate({
      where,
      _sum: { amount: true },
    });

    const total = summary._sum.amount ? summary._sum.amount.toString() : "0.00";

    return { success: true, data: { total } };
  } catch (error) {
    return { success: false, error: formatZodError(error) };
  }
}
