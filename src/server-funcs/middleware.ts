import { isRedirect, redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { clearCachedSession } from "@/lib/session-cache";
import { getServerSession } from "@/server-funcs/auth";

export const authMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    try {
      return await next();
    } catch (error) {
      // The session ended server-side (expired, or logged out in another tab).
      if (isRedirect(error)) clearCachedSession();
      throw error;
    }
  })
  .server(async ({ next }) => {
    const session = await getServerSession();

    if (!session) {
      throw redirect({ to: "/" });
    }

    return next({ context: { session } });
  });
