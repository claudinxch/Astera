import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  type GetAuthUserResponse,
  getAuthUser,
} from "@/server-funcs/get-auth-user";

export type WindowWithCachedSession = Window & {
  cachedSession?: GetAuthUserResponse;
};

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    let sessionData =
      typeof window !== "undefined"
        ? (window as WindowWithCachedSession).cachedSession
        : undefined;

    if (sessionData) {
      return sessionData;
    }

    sessionData = await getAuthUser();

    if (!sessionData) {
      throw redirect({
        to: "/",
      });
    }

    if (typeof window !== "undefined") {
      (window as WindowWithCachedSession).cachedSession = sessionData;
    }

    return sessionData;
  },
  component: App,
  ssr: "data-only",
  wrapInSuspense: true,
  pendingComponent: PendingComponent,
  pendingMinMs: 200,
  pendingMs: 50,
});

function App() {
  // const { user } = Route.useRouteContext();

  return <Outlet />;
}

function PendingComponent() {
  return (
    <div className="w-screen h-screen flex p-2 pl-64">
      <Card className="flex-1 bg-muted/30" />
    </div>
  );
}
