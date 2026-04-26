import { auth } from "@/auth";
import { Dashboard } from "@/app/components/Dashboard";

export default async function Home() {
  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      }
    : null;

  return <Dashboard user={user} />;
}