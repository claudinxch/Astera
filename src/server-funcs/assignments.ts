import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { assignments, courses, programs } from "@/db/schema";
import {
  createAssignmentSchema,
  idSchema,
  listAssignmentsSchema,
  markAssignmentCompleteSchema,
  updateAssignmentSchema,
} from "@/lib/validation";
import { authMiddleware } from "./middleware";

export const listAssignments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(listAssignmentsSchema)
  .handler(async ({ data, context }) => {
    const rows = await db
      .select({ assignment: assignments })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(courses.id, data.courseId),
          eq(programs.userId, context.session.user.id),
        ),
      );

    return rows.map((r) => r.assignment);
  });

export const getAssignment = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({ assignment: assignments })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(assignments.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!row) {
      throw new Error("Assignment not found");
    }

    return row.assignment;
  });

export const createAssignment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createAssignmentSchema)
  .handler(async ({ data, context }) => {
    const [course] = await db
      .select()
      .from(courses)
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(courses.id, data.courseId),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!course) {
      throw new Error("Course not found");
    }

    const [assignment] = await db
      .insert(assignments)
      .values({
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        type: data.type,
        customType: data.customType,
        importance: data.importance,
        estimatedHours: data.estimatedHours.toString(),
      })
      .returning();

    return assignment;
  });

export const updateAssignment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateAssignmentSchema)
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({ assignment: assignments })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(assignments.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!row) {
      throw new Error("Assignment not found");
    }

    const [updated] = await db
      .update(assignments)
      .set({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        type: data.type,
        customType: data.customType,
        importance: data.importance,
        status: data.status,
        estimatedHours: data.estimatedHours.toString(),
        updatedAt: new Date(),
      })
      .where(eq(assignments.id, data.id))
      .returning();

    return updated;
  });

export const deleteAssignment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({ assignment: assignments })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(assignments.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!row) {
      throw new Error("Assignment not found");
    }

    const [deleted] = await db
      .delete(assignments)
      .where(eq(assignments.id, data.id))
      .returning({ id: assignments.id });

    return { id: deleted.id };
  });

export const markAssignmentComplete = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(markAssignmentCompleteSchema)
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({ assignment: assignments })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(assignments.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!row) {
      throw new Error("Assignment not found");
    }

    const [updated] = await db
      .update(assignments)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(assignments.id, data.id))
      .returning();

    return updated;
  });
