import type { ClientSession } from "@/server-funcs/auth";

// Lets client-side navigations inside /app skip the session round-trip.
// Never touched on the server, where a module variable would be shared across requests.
let cachedSession: ClientSession | undefined;

const isBrowser = typeof window !== "undefined";

export const getCachedSession = () => (isBrowser ? cachedSession : undefined);

export const setCachedSession = (session: ClientSession) => {
  if (isBrowser) cachedSession = session;
};

export const clearCachedSession = () => {
  cachedSession = undefined;
};
