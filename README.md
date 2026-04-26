<div align="center">

# Fenmo SDE Tech Assessment

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-darkblue?style=for-the-badge&logo=postgresql)

A high-performance web application built for the Fenmo SDE Technical Assessment. This project leverages the latest capabilities of Next.js 16, React Compiler, and Tailwind CSS v4 to deliver a seamless user experience and a highly optimized developer workflow.

</div>

## 🚀 Live Demo

**View the application here:** https://fenmo-sde-test.vercel.app/

---

## 🛠 Tech Stack & Features

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 6](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Managed via [Neon.tech](https://neon.tech/))
- **ORM**: [Prisma 6](https://www.prisma.io/)
- **Authentication**: [NextAuth v5](https://authjs.dev/) (Credentials provider with JWT sessions)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (PostCSS Engine)
- **Validation**: [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Performance**:
    - **React Compiler**: Automatic memoization and optimized re-renders.
    - **Turbopack**: Lightning-fast development server and builds.

---

## ✨ Product Highlights

### 🔐 Authentication & Authorization
- **User registration** with bcrypt password hashing (12 rounds).
- **JWT-based sessions** via NextAuth v5 Credentials provider.
- **Auto sign-in** after registration — users are redirected straight to the dashboard.
- **Route protection** via Next.js 16 Proxy (formerly Middleware) — unauthenticated users are redirected to `/login`, authenticated users are redirected away from public routes.
- **Per-user data isolation** — users can only view, create, and delete their own expenses.

### 💰 Expense Management
- **Create expenses** with description, amount, date, and category.
- **Delete expenses** with a two-click confirmation pattern (prevents accidental deletions).
- **Idempotent writes** via client-generated UUIDs and a unique DB constraint.
- **Precise money handling** with Prisma `Decimal(10,2)` — no floating-point drift.
- **Real-time summary** that recalculates totals after any create or delete operation.
- **Filter by category** and **sort by date** (newest/oldest).

### 🎨 UX & Reliability
- **Server Actions** for all data mutations and queries — no API routes needed for CRUD.
- **Loading skeletons** and transition states keep the UI responsive.
- **Error boundary** (`error.tsx`) with retry functionality.
- **Toast notifications** (via Sonner) for success/error feedback.
- **Responsive design** optimized for desktop and mobile.

---

## ⚡ Performance & Optimization

- **React Compiler**: The `reactCompiler: true` flag automates performance optimizations, eliminating the need for manual `useMemo` or `useCallback`.
- **Turbopack**: `turbopackFileSystemCacheForDev` enables rapid HMR (Hot Module Replacement).
- **Tailwind CSS v4**: CSS-first engine for zero-runtime styling and minimal bundle sizes.
- **Data Layer**: Pooled connection to PostgreSQL on Neon for robust serverless database interactions.
- **Prisma Singleton**: Prevents connection pool exhaustion during development with hot reloading.

---

## 🚦 Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/aryan-singh2809/fenmo-sde-test.git
cd fenmo-test
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root of the project:
```env
DATABASE_URL="postgresql://[user]:[password]@[host]-pooler/neondb?sslmode=require"
DIRECT_URL="postgresql://[user]:[password]@[host]/neondb?sslmode=require"
AUTH_SECRET="your-random-secret-here"
AUTH_URL="http://localhost:3000"
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon pooler URL (contains `-pooler` in hostname) |
| `DIRECT_URL` | Neon direct URL for migrations |
| `AUTH_SECRET` | Random secret for signing JWT tokens (`openssl rand -hex 32`) |
| `AUTH_URL` | Base URL of the app (`http://localhost:3000` for dev, your domain for production) |

### 4. Initialize the Database
```bash
npx prisma db push
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✅ Scripts

```bash
npm run dev       # Start development server (Turbopack)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## 📂 Project Structure

```
/
├── prisma/
│   └── schema.prisma           # Database models (User, Expense)
├── public/                     # Static assets
└── src/
    ├── auth.ts                 # NextAuth v5 configuration
    ├── proxy.ts                # Route protection (Next.js 16 Proxy)
    ├── app/
    │   ├── globals.css         # Global styles
    │   ├── layout.tsx          # Root layout with Toaster
    │   ├── actions.ts          # Server Actions (auth + CRUD)
    │   ├── page.tsx            # Dashboard page (protected)
    │   ├── error.tsx           # Error boundary
    │   ├── login/page.tsx      # Login page
    │   ├── register/page.tsx   # Registration page
    │   ├── api/auth/[...nextauth]/route.ts  # NextAuth API route
    │   └── components/
    │       ├── Dashboard.tsx    # Main dashboard with filters & summary
    │       ├── ExpenseForm.tsx  # New expense form (idempotent)
    │       └── ExpenseTable.tsx # Expense list with delete buttons
    ├── components/ui/          # UI primitives (Button, Input, Select)
    ├── lib/
    │   ├── db.ts               # Prisma client singleton
    │   └── schema.ts           # Zod validation schemas & types
    └── types/
        └── next-auth.d.ts      # NextAuth type augmentation
```

---

## 🚀 Deployment

This application is optimized for deployment on [Vercel](https://vercel.com/).

**Required Vercel environment variables:**

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon pooler connection string |
| `DIRECT_URL` | Your Neon direct connection string |
| `AUTH_SECRET` | Random 32+ char hex secret |
| `AUTH_URL` | `https://your-domain.vercel.app` |

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aryan-singh2809/fenmo-sde-test)

---

## 🧠 Design Decisions & Trade-offs

### Authentication
- **NextAuth v5 (Credentials):** Chosen for self-contained auth without third-party OAuth complexity. Passwords are hashed with bcrypt (12 rounds).
- **JWT sessions:** Stateless sessions avoid database lookups on every request. User ID is stored in the JWT token.
- **Proxy-based route protection:** The Next.js 16 Proxy (formerly Middleware) handles auth redirects at the edge, before any page rendering.

### Financial Data Integrity (Decimal vs. Float)
- **Precision:** PostgreSQL `Decimal(10, 2)` prevents floating point drift (e.g., `0.1 + 0.2 !== 0.3`).
- **Transport:** Amounts are serialized as strings before returning to Client Components.

### Network Resilience & Idempotency
- **Client-side keys:** A UUID `idempotencyKey` is generated on mount and after successful submit.
- **Database enforcement:** A unique constraint ensures retries return the original record.

### Deletion & Data Consistency
- **Ownership verification:** Delete operations verify that the expense belongs to the requesting user before proceeding.
- **Two-click confirmation:** Prevents accidental deletions — first click highlights the button, second click confirms.
- **Atomic refresh:** After deletion, both the expense list and total summary are re-fetched to ensure consistency.

### Performance & Scalability
- **Indexes:** `category`, `date`, and `userId` are indexed for $O(\log n)$ filters and sorts.
- **Server Actions:** Mutations and queries run on the server to keep logic secure and fast.
- **Prisma singleton:** Prevents connection churn in serverless environments.

### UX & Reliability
- **Transitions:** `useTransition` keeps the UI responsive during filter changes and data mutations.
- **Error handling:** Local error state + global `error.tsx` provide clear fallback and retry.

### Trade-offs
- **Native select:** Standard HTML `select` (styled) was chosen for reliability and accessibility over more complex UI abstractions.
- **No pagination:** All expenses are loaded at once. For production with large datasets, cursor-based pagination would be recommended.

---

## 🧪 Suggested Tests (Vitest)

```ts
import { describe, expect, it } from "vitest";
import { expenseCreateSchema } from "@/lib/schema";

describe("expenseCreateSchema", () => {
    it("rejects negative amounts", () => {
        const result = expenseCreateSchema.safeParse({
            idempotencyKey: "test-key-1234",
            amount: "-1.00",
            date: "2026-04-26",
            category: "FOOD",
            description: "Test",
        });

        expect(result.success).toBe(false);
    });
});
```

```ts
import { describe, expect, it, vi } from "vitest";
import { createExpenseAction } from "@/app/actions";

vi.mock("@/lib/db", () => ({
    db: {
        expense: {
            findUnique: vi.fn().mockResolvedValue({
                id: "expense-1",
                idempotencyKey: "same-key",
                amount: { toString: () => "10.00" },
                date: new Date("2026-04-26"),
                category: "FOOD",
                description: "Coffee",
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
            create: vi.fn(),
        },
    },
}));

describe("createExpenseAction", () => {
    it("returns existing record for idempotency key", async () => {
        const result = await createExpenseAction({
            idempotencyKey: "same-key",
            amount: "10.00",
            date: "2026-04-26",
            category: "FOOD",
            description: "Coffee",
        });

        expect(result.success).toBe(true);
    });
});
```

```ts
import { describe, expect, it } from "vitest";

const formatCurrency = (value: string) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
        Number(value || 0)
    );

describe("formatCurrency", () => {
    it("formats INR amounts", () => {
        expect(formatCurrency("1234.56")).toBe("₹1,234.56");
    });
});
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
