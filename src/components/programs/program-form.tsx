import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  formatScore,
  GRADING_SCALE_INFO,
  GRADING_SCALES,
  type GradingScale,
} from "@/lib/grading-scale";
import { createProgramSchema } from "@/lib/validation";
import { createProgram } from "@/server-funcs/programs";

// Field turns its text red when invalid; keep the label neutral, only the error is red.
const FIELD_CLASS = "data-[invalid=true]:text-foreground";

type FieldErrors = { name?: string; institution?: string };

type Program = Awaited<ReturnType<typeof createProgram>>;

type ProgramFormProps = {
  onCreated: (program: Program) => void | Promise<void>;
  onCancel?: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export function ProgramForm({
  onCreated,
  onCancel,
  onPendingChange,
}: ProgramFormProps) {
  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const institutionRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [gradingScale, setGradingScale] = useState<GradingScale>("percent");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPendingState] = useState(false);

  const setPending = (value: boolean) => {
    setPendingState(value);
    onPendingChange?.(value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;

    const parsed = createProgramSchema.safeParse({
      name,
      institution,
      gradingScale,
    });

    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      setErrors({
        name: fieldErrors.name?.[0],
        institution: fieldErrors.institution?.[0],
      });
      (fieldErrors.name ? nameRef : institutionRef).current?.focus();
      return;
    }

    setErrors({});
    setPending(true);

    let program: Program;
    try {
      program = await createProgram({
        data: { name, institution, gradingScale },
      });
    } catch {
      toast.error("Couldn’t create the program. Please try again.");
      setPending(false);
      return;
    }

    // Stay pending on success: the host closes the form or navigates away.
    await onCreated(program);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FieldGroup className="gap-5">
        <Field data-invalid={!!errors.name} className={FIELD_CLASS}>
          <FieldLabel htmlFor={`${id}-name`} className="leading-none">
            Name
          </FieldLabel>
          <Input
            ref={nameRef}
            id={`${id}-name`}
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="BSc Computer Science"
            autoComplete="off"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
          />
          <div aria-live="polite" className="empty:-mt-2">
            {errors.name && (
              <FieldError
                id={`${id}-name-error`}
                role="none"
                className="text-xs"
              >
                {errors.name}
              </FieldError>
            )}
          </div>
        </Field>

        <Field data-invalid={!!errors.institution} className={FIELD_CLASS}>
          <FieldLabel htmlFor={`${id}-institution`} className="leading-none">
            Institution
            <span className="font-normal text-muted-foreground">Optional</span>
          </FieldLabel>
          <Input
            ref={institutionRef}
            id={`${id}-institution`}
            name="institution"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="University of São Paulo"
            autoComplete="off"
            aria-invalid={!!errors.institution}
            aria-describedby={
              errors.institution ? `${id}-institution-error` : undefined
            }
          />
          <div aria-live="polite" className="empty:-mt-2">
            {errors.institution && (
              <FieldError
                id={`${id}-institution-error`}
                role="none"
                className="text-xs"
              >
                {errors.institution}
              </FieldError>
            )}
          </div>
        </Field>

        <Field className={FIELD_CLASS}>
          <FieldTitle id={`${id}-scale`} className="leading-none">
            Grading scale
          </FieldTitle>
          <RadioGroup
            aria-labelledby={`${id}-scale`}
            aria-describedby={`${id}-scale-hint`}
            value={gradingScale}
            onValueChange={(value) => setGradingScale(value as GradingScale)}
            className="grid h-7 grid-cols-3 rounded-lg bg-muted p-0.5"
          >
            {GRADING_SCALES.map((scale) => (
              <Radio.Root
                key={scale}
                value={scale}
                className="flex cursor-default items-center justify-center rounded-md border border-transparent font-medium text-muted-foreground text-xs tabular-nums outline-none transition-colors duration-100 hover:text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 data-checked:bg-background data-checked:text-foreground dark:data-checked:border-input dark:data-checked:bg-input/30"
              >
                {GRADING_SCALE_INFO[scale].label}
              </Radio.Root>
            ))}
          </RadioGroup>
          <FieldDescription
            id={`${id}-scale-hint`}
            className="leading-(--text-xs--line-height)"
          >
            Scores are entered like {formatScore(gradingScale, 85)}. You can
            change this later.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending && <Spinner data-icon="inline-start" />}
          {pending ? "Creating…" : "Create program"}
        </Button>
      </div>
    </form>
  );
}
