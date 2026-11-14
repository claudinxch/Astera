import { useRouter } from "@tanstack/react-router";
import { useSetAtom } from "jotai/react";
import { type RefObject, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { activeProgramIdAtom } from "@/lib/atoms";
import { ProgramForm } from "./program-form";

type NewProgramDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: RefObject<HTMLElement | null>;
};

export function NewProgramDialog({
  open,
  onOpenChange,
  finalFocus,
}: NewProgramDialogProps) {
  const router = useRouter();
  const setActiveProgramId = useSetAtom(activeProgramIdAtom);
  const [pending, setPending] = useState(false);

  // The popup unmounts when closed, so the form state resets on every open.
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next);
      }}
    >
      <DialogContent
        className="sm:max-w-lg"
        showCloseButton={!pending}
        finalFocus={finalFocus}
      >
        <DialogHeader>
          <DialogTitle>New program</DialogTitle>
          <DialogDescription>
            A program holds your courses, assignments and exams.
          </DialogDescription>
        </DialogHeader>
        <ProgramForm
          onPendingChange={setPending}
          onCancel={() => onOpenChange(false)}
          onCreated={async (program) => {
            setActiveProgramId(program.id);
            let refreshed = true;
            try {
              await router.invalidate();
            } catch {
              refreshed = false;
            } finally {
              setPending(false);
              onOpenChange(false);
            }
            if (refreshed) {
              toast.success("Program created");
            } else {
              toast.error(
                "Program created, but the list didn't refresh. Reload the page.",
              );
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
