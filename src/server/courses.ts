import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, programs } from "@/db/schema";
import {
  createCourseSchema,
  idSchema,
  listCoursesSchema,
  updateCourseSchema,
} from "@/lib/validation";
import { authMiddleware } from "@/server/middleware";

export const listCourses = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(listCoursesSchema)
  .handler(async ({ data, context }) => {
    const rows = await db
      .select({ course: courses })
      .from(courses)
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(courses.programId, data.programId),
          eq(programs.userId, context.session.user.id),
        ),
      );

    return rows.map((r) => r.course);
  });

export const getCourse = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({ course: courses })
      .from(courses)
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(courses.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!row) {
      throw new Error("Course not found");
    }

    return row.course;
  });

export const createCourse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createCourseSchema)
  .handler(async ({ data, context }) => {
    const [program] = await db
      .select()
      .from(programs)
      .where(
        and(
          eq(programs.id, data.programId),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!program) {
      throw new Error("Program not found");
    }

    const [course] = await db
      .insert(courses)
      .values({
        programId: data.programId,
        name: data.name,
        code: data.code,
        term: data.term,
        difficulty: data.difficulty,
      })
      .returning();

    return course;
  });

export const updateCourse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateCourseSchema)
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({ course: courses })
      .from(courses)
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(courses.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!row) {
      throw new Error("Course not found");
    }

    const [updated] = await db
      .update(courses)
      .set({
        name: data.name,
        code: data.code,
        term: data.term,
        difficulty: data.difficulty,
        currentGrade: data.currentGrade?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(courses.id, data.id))
      .returning();

    return updated;
  });

export const deleteCourse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({ course: courses })
      .from(courses)
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(
          eq(courses.id, data.id),
          eq(programs.userId, context.session.user.id),
        ),
      );

    if (!row) {
      throw new Error("Course not found");
    }

    const [deleted] = await db
      .delete(courses)
      .where(eq(courses.id, data.id))
      .returning({ id: courses.id });

    return { id: deleted.id };
  });
