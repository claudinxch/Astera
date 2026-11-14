import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const getServerSession = createServerOnlyFn(async () => {
  return await auth.api.getSession({ headers: getRequestHeaders() });
});

// Only the user goes to the client; the session token must stay in the httpOnly cookie.
export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getServerSession();
    if (!session) return null;

    const { id, name, email, image } = session.user;
    return { user: { id, name, email, image } };
  },
);

export type ClientSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;
