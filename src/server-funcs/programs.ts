import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { programs } from "@/db/schema";
import {
  createProgramSchema,
  idSchema,
  updateProgramSchema,
} from "@/lib/validation";
import { authMiddleware } from "./middleware";

export const listPrograms = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db
      .select()
      .from(programs)
      .where(eq(programs.userId, context.session.user.id));
  });

export const getProgram = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const [program] = await db
      .select()
      .from(programs)
      .where(
        and(
          eq(programs.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!program) {
      throw new Error("Program not found");
    }

    return program;
  });

export const createProgram = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createProgramSchema)
  .handler(async ({ data, context }) => {
    const [program] = await db
      .insert(programs)
      .values({
        userId: context.session.user.id,
        name: data.name.trim(),
      })
      .returning();

    return program;
  });

export const updateProgram = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateProgramSchema)
  .handler(async ({ data, context }) => {
    const [program] = await db
      .update(programs)
      .set({ name: data.name.trim(), updatedAt: new Date() })
      .where(
        and(
          eq(programs.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      )
      .returning();

    if (!program) {
      throw new Error("Program not found");
    }

    return program;
  });

export const deleteProgram = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const [deleted] = await db
      .delete(programs)
      .where(
        and(
          eq(programs.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      )
      .returning({ id: programs.id });

    if (!deleted) {
      throw new Error("Program not found");
    }

    return { id: deleted.id };
  });
