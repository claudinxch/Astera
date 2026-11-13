import { atomWithCookie } from "@/utils/cookie-atoms";

export const activeProgramIdAtom = atomWithCookie<string | null>(
  "activeProgramId",
  null,
);
