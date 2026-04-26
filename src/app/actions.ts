"use server";

import { Prisma, type Expense as DbExpense } from "@prisma/client";
import { db } from "@/lib/db";
import {
  expenseCreateSchema,
  loginSchema,
  registerSchema,
  type Expense,
  type ExpenseCreate,
  type ExpenseCreateInput,
} from "@/lib/schema";
import { auth, signIn, signOut } from "@/auth";
import { hash } from "bcryptjs";

type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type AuthActionState = { success: boolean; error?: string };

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

const requireUser = async (): Promise<{ id: string; name?: string | null; email?: string | null }> => {
  const session = await auth();
  const user = session?.user as { id?: string; name?: string | null; email?: string | null } | undefined;

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  return { id: user.id, name: user.name, email: user.email };
};


export async function registerUserAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((issue) => issue.message).join("; "),
    };
  }

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    return { success: false, error: "Email already exists" };
  }

  const passwordHash = await hash(password, 12);

  await db.user.create({
    data: {
      name,
      email,
      password: passwordHash,
    },
  });

  // Auto sign-in after successful registration
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error: unknown) {
    // Re-throw NEXT_REDIRECT so Next.js processes the redirect
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as Error & { digest: string }).digest === "string" &&
      (error as Error & { digest: string }).digest.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }
    // If auto-sign-in fails, still return success — user can sign in manually
    return { success: true };
  }

  return { success: true };
}


export async function loginUserAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((issue) => issue.message).join("; "),
    };
  }

  const { email, password } = parsed.data;
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error: unknown) {
    // NextAuth v5 signIn() throws a NEXT_REDIRECT on success — re-throw it
    // so Next.js can process the redirect.
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as Error & { digest: string }).digest === "string" &&
      (error as Error & { digest: string }).digest.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }

    if (error instanceof Error && error.name === "CredentialsSignin") {
      return { success: false, error: "Invalid credentials" };
    }
    return { success: false, error: "Invalid credentials" };
  }

  return { success: true };
}


export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function getCurrentUserAction(): Promise<
  ActionResponse<{ name: string | null; email: string | null }>
> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  return {
    success: true,
    data: {
      name: session.user.name ?? null,
      email: session.user.email ?? null,
    },
  };
}

export async function createExpenseAction(
  data: ExpenseCreateInput
): Promise<ActionResponse<Expense>> {
  const parsed = expenseCreateSchema.safeParse(data);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("; ");
    return { success: false, error: message };
  }

  const input: ExpenseCreate = parsed.data;
  const user = await requireUser();

  const existing = await db.expense.findUnique({
    where: {
      userId_idempotencyKey: {
        userId: user.id,
        idempotencyKey: input.idempotencyKey,
      },
    },
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
        userId: user.id,
      },
    });

    return { success: true, data: serializeExpense(created) };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const duplicate = await db.expense.findUnique({
        where: {
          userId_idempotencyKey: {
            userId: user.id,
            idempotencyKey: input.idempotencyKey,
          },
        },
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
    const user = await requireUser();
    const where = {
      userId: user.id,
      ...(filters.category ? { category: filters.category } : {}),
    };
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
    const user = await requireUser();
    const where = {
      userId: user.id,
      ...(filters.category ? { category: filters.category } : {}),
    };

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
