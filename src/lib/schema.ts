import { z } from "zod";

const moneyRegex = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

const sanitizeText = (value: string) =>
  value.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();

export const expenseCategorySchema = z.enum([
  "FOOD",
  "TRANSPORT",
  "UTILITIES",
  "RENT",
  "ENTERTAINMENT",
  "HEALTH",
  "EDUCATION",
  "SHOPPING",
  "TRAVEL",
  "OTHER",
]);

export const expenseCreateSchema = z.object({
  idempotencyKey: z.string().trim().min(8).max(128),
  amount: z
    .string()
    .trim()
    .regex(moneyRegex, "Amount must be a non-negative number with up to 2 decimals"),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .transform((value) => new Date(`${value}T00:00:00Z`)),
  category: expenseCategorySchema,
  description: z
    .string()
    .transform(sanitizeText)
    .refine((value) => value.length > 0, "Description is required")
    .refine((value) => value.length <= 500, "Description must be at most 500 characters"),
});

export const expenseSchema = expenseCreateSchema.extend({
  id: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
});

export type ExpenseCreateInput = z.input<typeof expenseCreateSchema>;
export type ExpenseCreate = z.output<typeof expenseCreateSchema>;
export type Expense = z.output<typeof expenseSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
