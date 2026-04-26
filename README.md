<div align="center">

# Fenmo SDE Tech Assessment

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
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
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Managed via [Neon.tech](https://neon.tech/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (PostCSS Engine)
- **Deployment**: [Vercel](https://vercel.com/)
- **Performance**:
    - **React Compiler**: Automatic memoization and optimized re-renders.
    - **Turbopack**: Lightning-fast development server and builds.

---

## ✨ Product Highlights

- **Idempotent writes** via client-generated UUIDs and a unique DB constraint.
- **Precise money handling** with Prisma `Decimal(10,2)`.
- **Server Actions** for secure data mutations and queries.
- **Real-time summary** that respects filters and sorting.
- **Resilient UX** with loading states, retry UI, and an error boundary.

---

## ⚡ Performance & Optimization

This project is built with a focus on modern web performance standards:

- **React Compiler**: The experimental `reactCompiler: true` flag is enabled to automate performance optimizations, eliminating the need for manual `useMemo` or `useCallback`.
- **Turbopack**: `turbopackFileSystemCacheForDev` is used for rapid HMR (Hot Module Replacement) and development cycles.
- **Tailwind CSS v4**: Utilizes a new CSS-first engine for zero-runtime styling and minimal CSS bundle sizes.
- **Data Layer**: Employs a pooled connection to a PostgreSQL instance on Neon, ensuring robust and scalable database interactions in a serverless environment.

---

## 🚦 Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone [Your Repo URL]
cd fenmo-test
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root of the project and add your database connection string:
```env
DATABASE_URL="postgresql://[user]:[password]@[host]/neondb?sslmode=require"   # Neon pooler URL for the app
DIRECT_URL="postgresql://[user]:[password]@[host]/neondb?sslmode=require"     # Neon direct URL for migrations
```

**Note:** `DATABASE_URL` should use the Neon pooler host (contains `-pooler`), and `DIRECT_URL` should use the direct host (no `-pooler`).

### 4. Initialize the Database
Sync your Prisma schema with the database. This will create the necessary tables.
```bash
npx prisma db push
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## ✅ Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## 📂 Project Structure

```
/
├── prisma/
│   └── schema.prisma       # Prisma schema for database models
├── public/                 # Static assets
└── src/
    ├── app/                # Next.js App Router pages
    │   ├── globals.css     # Global styles
    │   ├── layout.tsx      # Root layout
    │   ├── actions.ts      # Server Actions (mutations + queries)
    │   └── page.tsx        # Main page component
    │   └── components/     # Expense UI components
    ├── components/         # UI primitives (buttons, inputs, select)
    └── lib/
        ├── db.ts           # Prisma client instance (singleton)
        └── schema.ts       # Zod validation + shared types
```

---

## 🚀 Deployment

This application is optimized for deployment on [Vercel](https://vercel.com/).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=[Your-Repo-URL])

---

## 🧠 Design Decisions & Trade-offs

### Financial Data Integrity (Decimal vs. Float)
- **Precision:** PostgreSQL `Decimal(10, 2)` prevents floating point drift (e.g., `0.1 + 0.2 !== 0.3`).
- **Transport:** Amounts are serialized as strings before returning to Client Components.

### Network Resilience & Idempotency
- **Client-side keys:** A UUID `idempotencyKey` is generated on mount and after successful submit.
- **Database enforcement:** A unique constraint ensures retries return the original record.

### Performance & Scalability
- **Indexes:** `category` and `date` are indexed for $O(\log n)$ filters and sorts.
- **Server Actions:** Mutations and queries run on the server to keep logic secure and fast.
- **Prisma singleton:** Prevents connection churn in serverless environments.

### UX & Reliability
- **Transitions:** `useTransition` keeps the UI responsive during filter changes.
- **Error handling:** Local error state + global `error.tsx` provide clear fallback and retry.

### Trade-offs
- **Native select:** Standard HTML `select` (styled) was chosen for reliability and accessibility over more complex UI abstractions within the 4-hour scope.

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
