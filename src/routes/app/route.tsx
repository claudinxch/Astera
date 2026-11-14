import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { getCachedSession, setCachedSession } from "@/lib/session-cache";
import { getSession } from "@/server-funcs/auth";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const cached = getCachedSession();
    if (cached) return cached;

    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/" });
    }

    setCachedSession(session);
    return session;
  },
  component: Outlet,
  ssr: "data-only",
  wrapInSuspense: true,
  pendingComponent: PendingComponent,
  pendingMinMs: 200,
  pendingMs: 300,
});

function PendingComponent() {
  return (
    <div className="fade-in-0 flex h-screen w-screen animate-in p-2 pl-64 duration-150">
      <Card className="flex-1 bg-muted/30" />
    </div>
  );
}
