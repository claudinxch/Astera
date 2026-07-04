import { z } from "zod";

export const idSchema = z.object({
  id: z.uuid(),
});

// Programs

export const createProgramSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const updateProgramSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, "Name is required"),
});

// Coursers

export const listCoursesSchema = z.object({
  programId: z.uuid(),
});

export const createCourseSchema = z.object({
  programId: z.uuid(),
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
  term: z.string().trim().min(1, "Term is required"),
  difficulty: z.number().int().min(1).max(5).default(3),
});

export const updateCourseSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
  term: z.string().trim().min(1, "Term is required"),
  difficulty: z.number().int().min(1).max(5),
  currentGrade: z.number().min(0).max(10).nullable().optional(),
});

// Assignments

export const listAssignmentsSchema = z.object({
  courseId: z.uuid(),
});

export const assignmentType = z.enum([
  "homework",
  "project",
  "quiz",
  "lab",
  "reading",
  "other",
]);

export const assignmentStatus = z.enum([
  "not_started",
  "in_progress",
  "completed",
]);

export const createAssignmentSchema = z
  .object({
    courseId: z.uuid(),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().optional(),
    dueDate: z.coerce.date(),
    type: assignmentType,
    customType: z.string().trim().min(1).optional(),
    importance: z.number().int().min(1).max(5).default(3),
    estimatedHours: z.number().positive().default(1),
  })
  .refine((data) => data.type !== "other" || !!data.customType, {
    message: "customType is required when type is 'other'",
    path: ["customType"],
  });

export const updateAssignmentSchema = z
  .object({
    id: z.uuid(),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().optional(),
    dueDate: z.coerce.date(),
    type: assignmentType,
    customType: z.string().trim().min(1).optional(),
    importance: z.number().int().min(1).max(5),
    status: assignmentStatus,
    estimatedHours: z.number().positive(),
  })
  .refine((data) => data.type !== "other" || !!data.customType, {
    message: "customType is required when type is 'other'",
    path: ["customType"],
  });

export const updateAssignmentStatusSchema = z.object({
  id: z.uuid(),
  status: assignmentStatus,
});

export const markAssignmentCompleteSchema = z.object({
  id: z.uuid(),
});

// Exams

export const listExamsSchema = z.object({
  courseId: z.uuid(),
});

export const createExamSchema = z.object({
  courseId: z.uuid(),
  title: z.string().trim().min(1, "Title is required"),
  date: z.coerce.date(),
  weight: z.number().min(0).max(100),
  topics: z.string().trim().optional(),
});

export const updateExamSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1, "Title is required"),
  date: z.coerce.date(),
  weight: z.number().min(0).max(100),
  topics: z.string().trim().optional(),
  status: z.enum(["upcoming", "completed"]),
});
