import { relations } from "drizzle-orm";
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

export const programsRelations = relations(programs, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  program: one(programs, {
    fields: [courses.programId],
    references: [programs.id],
  }),
  assignments: many(assignments),
  exams: many(exams),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
  recommendationItems: many(recommendationItems),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  course: one(courses, {
    fields: [exams.courseId],
    references: [courses.id],
  }),
  recommendationItems: many(recommendationItems),
}));

export const dailyRecommendationsRelations = relations(
  dailyRecommendations,
  ({ many }) => ({
    items: many(recommendationItems),
  }),
);

export const recommendationItemsRelations = relations(
  recommendationItems,
  ({ one }) => ({
    dailyRecommendation: one(dailyRecommendations, {
      fields: [recommendationItems.dailyRecommendationId],
      references: [dailyRecommendations.id],
    }),
    assignment: one(assignments, {
      fields: [recommendationItems.assignmentId],
      references: [assignments.id],
    }),
    exam: one(exams, {
      fields: [recommendationItems.examId],
      references: [exams.id],
    }),
  }),
);
