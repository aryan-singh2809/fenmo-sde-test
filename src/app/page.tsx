import { CheckCircle, Database, Rocket, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full space-y-8 text-center">
        
        {/* Header Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <CheckCircle size={16} />
            Environment Verified
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-linear-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Fenmo SDE Readiness
          </h1>
          <p className="text-neutral-400 text-lg">
            Next.js 16 + React 19 + Tailwind v4 + Prisma + NeonDB
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
            <Rocket className="text-blue-400 mb-2" size={20} />
            <h3 className="font-semibold text-neutral-200">Deployment</h3>
            <p className="text-xs text-neutral-500">CI/CD Pipeline Active</p>
          </div>
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
            <Database className="text-purple-400 mb-2" size={20} />
            <h3 className="font-semibold text-neutral-200">Database</h3>
            <p className="text-xs text-neutral-500">NeonDB Connection Live</p>
          </div>
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
            <Shield className="text-emerald-400 mb-2" size={20} />
            <h3 className="font-semibold text-neutral-200">Optimized</h3>
            <p className="text-xs text-neutral-500">React Compiler Enabled</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-8 border-t border-neutral-800 text-neutral-600 text-sm">
          Awaiting problem statement. Ready to build.
        </div>
      </div>
    </main>
  );
}