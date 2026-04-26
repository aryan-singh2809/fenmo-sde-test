"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerUserAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { success: false } as { success: boolean; error?: string };

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    registerUserAction,
    initialState
  );

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success("Account created. Please sign in.");
      router.push("/login");
      return;
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Create account</h1>
          <p className="text-sm text-neutral-400">
            Set up your profile to start tracking expenses.
          </p>
        </div>

        <form
          action={formAction}
          className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400">Name</label>
            <Input name="name" type="text" autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400">Email</label>
            <Input name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400">Password</label>
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-300 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
