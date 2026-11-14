import { createServerFn } from "@tanstack/react-start";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  assignments,
  courses,
  dailyPlanItems,
  dailyPlans,
  exams,
  programs,
} from "@/db/schema";
import { authMiddleware } from "@/server-funcs/middleware";

const TOP_N = 5;

// Caps urgency so far-off deadlines all score 0 instead of differing slightly.
const URGENCY_WINDOW_DAYS = 14;

const todayDateString = (): string => {
  return new Date().toISOString().slice(0, 10);
};

const daysUntil = (date: Date): number => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const urgencyScore = (daysUntilDue: number): number => {
  if (daysUntilDue <= 0) return 10;
  if (daysUntilDue >= URGENCY_WINDOW_DAYS) return 0;
  return 10 - (daysUntilDue / URGENCY_WINDOW_DAYS) * 10;
};

const formatDueLabel = (daysUntilDue: number): string => {
  if (daysUntilDue < 0) return `overdue by ${Math.abs(daysUntilDue)} day(s)`;
  if (daysUntilDue === 0) return "due today";
  if (daysUntilDue === 1) return "due tomorrow";
  return `due in ${daysUntilDue} days`;
};

type ScoredItem = {
  assignmentId: string | null;
  examId: string | null;
  reason: string;
  priorityScore: number;
};

const dateParamSchema = z.object({
  date: z.iso.date().optional(),
});

export const generateDailyPlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(dateParamSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id;
    const targetDate = data.date ?? todayDateString();

    const assignmentRows = await db
      .select({
        id: assignments.id,
        dueDate: assignments.dueDate,
        importance: assignments.importance,
        estimatedHours: assignments.estimatedHours,
        status: assignments.status,
        difficulty: courses.difficulty,
      })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(
        and(eq(programs.userId, userId), ne(assignments.status, "completed")),
      );

    const examRows = await db
      .select({
        id: exams.id,
        date: exams.date,
        weight: exams.weight,
        difficulty: courses.difficulty,
      })
      .from(exams)
      .innerJoin(courses, eq(exams.courseId, courses.id))
      .innerJoin(programs, eq(courses.programId, programs.id))
      .where(and(eq(programs.userId, userId), eq(exams.status, "upcoming")));

    const scoredAssignments: ScoredItem[] = assignmentRows.map((a) => {
      const days = daysUntil(a.dueDate);
      const estimatedHours = Number(a.estimatedHours);

      const score =
        urgencyScore(days) * 3 +
        a.importance * 2 +
        a.difficulty * 1 +
        Math.min(estimatedHours, 5) * 1 +
        (a.status === "not_started" ? 3 : a.status === "in_progress" ? 1 : 0);

      return {
        assignmentId: a.id,
        examId: null,
        reason: `${formatDueLabel(days)}, importance ${a.importance}/5, course difficulty ${a.difficulty}/5`,
        priorityScore: score,
      };
    });

    const scoredExams: ScoredItem[] = examRows.map((e) => {
      const days = daysUntil(e.date);
      const weight = Number(e.weight);

      const score =
        urgencyScore(days) * 3 + (weight / 100) * 10 * 2 + e.difficulty * 1;

      return {
        assignmentId: null,
        examId: e.id,
        reason: `${formatDueLabel(days)}, worth ${weight}% of grade, course difficulty ${e.difficulty}/5`,
        priorityScore: score,
      };
    });

    const topItems = [...scoredAssignments, ...scoredExams]
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, TOP_N);

    await db
      .delete(dailyPlans)
      .where(
        and(eq(dailyPlans.userId, userId), eq(dailyPlans.date, targetDate)),
      );

    const [plan] = await db
      .insert(dailyPlans)
      .values({ userId, date: targetDate })
      .returning();

    if (topItems.length === 0) {
      return { plan, items: [] };
    }

    const insertedItems = await db
      .insert(dailyPlanItems)
      .values(
        topItems.map((item) => ({
          dailyPlanId: plan.id,
          assignmentId: item.assignmentId,
          examId: item.examId,
          reason: item.reason,
          priorityScore: item.priorityScore.toFixed(2),
        })),
      )
      .returning();

    return { plan, items: insertedItems };
  });

export const getDailyPlan = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(dateParamSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id;
    const targetDate = data.date ?? todayDateString();

    const [plan] = await db
      .select()
      .from(dailyPlans)
      .where(
        and(eq(dailyPlans.userId, userId), eq(dailyPlans.date, targetDate)),
      );

    if (!plan) {
      return null;
    }

    const rows = await db
      .select({
        item: dailyPlanItems,
        assignmentTitle: assignments.title,
        assignmentDueDate: assignments.dueDate,
        examTitle: exams.title,
        examDate: exams.date,
      })
      .from(dailyPlanItems)
      .leftJoin(assignments, eq(dailyPlanItems.assignmentId, assignments.id))
      .leftJoin(exams, eq(dailyPlanItems.examId, exams.id))
      .where(eq(dailyPlanItems.dailyPlanId, plan.id));

    const items = rows.map((r) => ({
      id: r.item.id,
      type: r.item.assignmentId ? ("assignment" as const) : ("exam" as const),
      reason: r.item.reason,
      priorityScore: Number(r.item.priorityScore),
      title: r.assignmentTitle ?? r.examTitle ?? "Untitled",
      dueDate: r.assignmentDueDate ?? r.examDate ?? null,
    }));

    items.sort((a, b) => b.priorityScore - a.priorityScore);

    return { plan, items };
  });
