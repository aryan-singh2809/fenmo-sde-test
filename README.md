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
DATABASE_URL="postgresql://[user]:[password]@[host]/neondb?sslmode=require"
```

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
    │   └── page.tsx        # Main page component
    └── lib/
        └── db.ts           # Prisma client instance
```

---

## 🚀 Deployment

This application is optimized for deployment on [Vercel](https://vercel.com/).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=[Your-Repo-URL])

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
