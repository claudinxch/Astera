import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai/react";
import { ProgramForm } from "@/components/programs/program-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { activeProgramIdAtom } from "@/lib/atoms";
import { listPrograms } from "@/server-funcs/programs";

export const Route = createFileRoute("/app/new-program")({
  beforeLoad: async () => {
    const programs = await listPrograms();
    if (programs.length > 0) {
      throw redirect({ to: "/app" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const setActiveProgramId = useSetAtom(activeProgramIdAtom);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="fade-in-0 slide-in-from-bottom-2 w-full max-w-lg duration-200 motion-safe:animate-in">
        <CardHeader>
          <CardTitle className="text-base">Create your first program</CardTitle>
          <CardDescription>
            Your courses, assignments and exams live inside a program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramForm
            onCreated={(program) => {
              setActiveProgramId(program.id);
              navigate({ to: "/app" });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
