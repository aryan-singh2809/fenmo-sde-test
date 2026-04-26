"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-6 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-300">
          <AlertTriangle size={24} />
        </div>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-neutral-400">
          We could not load your expense data. Please try again.
        </p>
        <Button type="button" onClick={reset} className="mt-2">
          Retry
        </Button>
      </div>
    </main>
  );
}
