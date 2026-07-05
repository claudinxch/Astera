import { createServerFn } from "@tanstack/react-start";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  assignments,
  courses,
  dailyRecommendations,
  exams,
  programs,
  recommendationItems,
} from "@/db/schema";
import { authMiddleware } from "@/server/middleware";

// How many items go into a single day's recommendation. A "daily
// recommendation" is meant to be a short, actionable list, not a full
// dump of everything outstanding.
const TOP_N = 5;

// Days-until-due beyond which urgency stops mattering for scoring
// purposes. Keeps "due in 20 days" from scoring meaningfully
// differently than "due in 200 days" — both just become 0.
const URGENCY_WINDOW_DAYS = 14;

const todayDateString = (): string => {
  return new Date().toISOString().slice(0, 10);
};

const daysUntil = (date: Date): number => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// Urgency score, 0-10. Overdue or due today/tomorrow scores highest.
// Linearly decays to 0 at URGENCY_WINDOW_DAYS out.
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

// ---- Generate (or regenerate) a day's recommendation (defaults to today, server UTC) ----

export const generateDailyRecommendation = createServerFn({ method: "POST" })
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
      .delete(dailyRecommendations)
      .where(
        and(
          eq(dailyRecommendations.userId, userId),
          eq(dailyRecommendations.date, targetDate),
        ),
      );

    const [recommendation] = await db
      .insert(dailyRecommendations)
      .values({ userId, date: targetDate })
      .returning();

    if (topItems.length === 0) {
      return { recommendation, items: [] };
    }

    const insertedItems = await db
      .insert(recommendationItems)
      .values(
        topItems.map((item) => ({
          dailyRecommendationId: recommendation.id,
          assignmentId: item.assignmentId,
          examId: item.examId,
          reason: item.reason,
          priorityScore: item.priorityScore.toFixed(2),
        })),
      )
      .returning();

    return { recommendation, items: insertedItems };
  });

// ---- Get a day's recommendation (defaults to today, server UTC), with titles joined in ----

export const getDailyRecommendation = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(dateParamSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id;
    const targetDate = data.date ?? todayDateString();

    const [recommendation] = await db
      .select()
      .from(dailyRecommendations)
      .where(
        and(
          eq(dailyRecommendations.userId, userId),
          eq(dailyRecommendations.date, targetDate),
        ),
      );

    if (!recommendation) {
      return null;
    }

    const rows = await db
      .select({
        item: recommendationItems,
        assignmentTitle: assignments.title,
        assignmentDueDate: assignments.dueDate,
        examTitle: exams.title,
        examDate: exams.date,
      })
      .from(recommendationItems)
      .leftJoin(
        assignments,
        eq(recommendationItems.assignmentId, assignments.id),
      )
      .leftJoin(exams, eq(recommendationItems.examId, exams.id))
      .where(eq(recommendationItems.dailyRecommendationId, recommendation.id));

    const items = rows.map((r) => ({
      id: r.item.id,
      type: r.item.assignmentId ? ("assignment" as const) : ("exam" as const),
      reason: r.item.reason,
      priorityScore: Number(r.item.priorityScore),
      title: r.assignmentTitle ?? r.examTitle ?? "Untitled",
      dueDate: r.assignmentDueDate ?? r.examDate ?? null,
    }));

    items.sort((a, b) => b.priorityScore - a.priorityScore);

    return { recommendation, items };
  });
