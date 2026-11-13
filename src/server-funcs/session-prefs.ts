import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

export const getActiveProgramIdCookie = createServerFn().handler(async () => {
  const raw = getCookie("astera_activeProgramId");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as string;
  } catch {
    return null;
  }
});
