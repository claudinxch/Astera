import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, exams, programs } from "@/db/schema";
import {
  createExamSchema,
  idSchema,
  listExamsSchema,
  updateExamSchema,
} from "@/lib/validation";
import { authMiddleware } from "@/server/middleware";

export const listExams = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(listExamsSchema)
  .handler(async ({ data, context }) => {
    const rows = await db
      .select({ exam: exams })
      .from(exams)
      .innerJoin(courses, eq(exams.courseId, courses.id))
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(exams.courseId, data.courseId),
          eq(programs.userId, context.session.user.id),
        ),
      );

    return rows.map((r) => r.exam);
  });

export const getExam = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({ exam: exams })
      .from(exams)
      .innerJoin(courses, eq(exams.courseId, courses.id))
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(exams.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!row) {
      throw new Error("Exam not found");
    }

    return row.exam;
  });

export const createExam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createExamSchema)
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

    const [exam] = await db
      .insert(exams)
      .values({
        courseId: data.courseId,
        title: data.title,
        date: data.date,
        weight: data.weight.toString(),
        topics: data.topics,
      })
      .returning();

    return exam;
  });

export const updateExam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateExamSchema)
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({ exam: exams })
      .from(exams)
      .innerJoin(courses, eq(exams.courseId, courses.id))
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(exams.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!row) {
      throw new Error("Exam not found");
    }

    const [updated] = await db
      .update(exams)
      .set({
        title: data.title,
        date: data.date,
        weight: data.weight.toString(),
        topics: data.topics,
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(exams.id, data.id))
      .returning();

    return updated;
  });

export const deleteExam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({ exam: exams })
      .from(exams)
      .innerJoin(courses, eq(exams.courseId, courses.id))
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(exams.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!row) {
      throw new Error("Exam not found");
    }

    const [deleted] = await db
      .delete(exams)
      .where(eq(exams.id, data.id))
      .returning({ id: exams.id });

    return { id: deleted.id };
  });
