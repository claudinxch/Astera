import { getRouteApi } from "@tanstack/react-router";
import { useAtom } from "jotai/react";
import { useEffect } from "react";
import { activeProgramIdAtom } from "@/lib/atoms";

const route = getRouteApi("/app/_main");

export const useProgramSwitcher = () => {
  const { activeProgramId: programId, programs } = route.useRouteContext();
  const [activeProgramId, setActiveProgramId] = useAtom(activeProgramIdAtom);

  useEffect(() => {
    if (!activeProgramId) {
      setActiveProgramId(programId);
    }
  }, [programId, setActiveProgramId, activeProgramId]);

  const activeProgram =
    programs.find((p) => p.id === (activeProgramId ?? programId)) ??
    programs[0];

  return { activeProgram, activeProgramId, setActiveProgramId, programs };
};
