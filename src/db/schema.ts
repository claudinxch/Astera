import { defineRelations } from "drizzle-orm";
import {
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const assignmentTypeEnum = pgEnum("assignment_type", [
  "homework",
  "project",
  "quiz",
  "lab",
  "reading",
  "other",
]);

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "not_started",
  "in_progress",
  "completed",
]);

export const examStatusEnum = pgEnum("exam_status", ["upcoming", "completed"]);

export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---- Courses (individual class, e.g. "Calculus I", "Networks") ----

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  programId: uuid("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. "Calculus I"
  code: text("code").notNull(),
  term: text("term").notNull(), // e.g. "Fall 2026"
  difficulty: integer("difficulty").notNull().default(3), // 1-5 self-rated
  currentGrade: numeric("current_grade", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  type: assignmentTypeEnum("type").notNull().default("homework"),
  customType: text("custom_type"), // only set when type = "other"
  importance: integer("importance").notNull().default(3),
  estimatedHours: numeric("estimated_hours", { precision: 5, scale: 2 })
    .notNull()
    .default("1"),
  status: assignmentStatusEnum("status").notNull().default("not_started"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const exams = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull(),
  topics: text("topics"),
  status: examStatusEnum("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dailyRecommendations = pgTable("daily_recommendations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const recommendationItems = pgTable("recommendation_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  dailyRecommendationId: uuid("daily_recommendation_id")
    .notNull()
    .references(() => dailyRecommendations.id, { onDelete: "cascade" }),
  assignmentId: uuid("assignment_id").references(() => assignments.id, {
    onDelete: "cascade",
  }),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  priorityScore: numeric("priority_score", {
    precision: 6,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const relations = defineRelations(
  {
    programs,
    courses,
    assignments,
    exams,
    dailyRecommendations,
    recommendationItems,
  },
  (r) => ({
    programs: {
      courses: r.many.courses(),
    },
    courses: {
      program: r.one.programs({
        from: r.courses.programId,
        to: r.programs.id,
      }),
      assignments: r.many.assignments(),
      exams: r.many.exams(),
    },
    assignments: {
      course: r.one.courses({
        from: r.assignments.courseId,
        to: r.courses.id,
      }),
      recommendationItems: r.many.recommendationItems(),
    },
    exams: {
      course: r.one.courses({
        from: r.exams.courseId,
        to: r.courses.id,
      }),
      recommendationItems: r.many.recommendationItems(),
    },
    dailyRecommendations: {
      items: r.many.recommendationItems(),
    },
    recommendationItems: {
      dailyRecommendation: r.one.dailyRecommendations({
        from: r.recommendationItems.dailyRecommendationId,
        to: r.dailyRecommendations.id,
      }),
      assignment: r.one.assignments({
        from: r.recommendationItems.assignmentId,
        to: r.assignments.id,
      }),
      exam: r.one.exams({
        from: r.recommendationItems.examId,
        to: r.exams.id,
      }),
    },
  }),
);
