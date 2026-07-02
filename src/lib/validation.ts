import { z } from "zod";

export const idSchema = z.object({
  id: z.uuid(),
});

export const createProgramSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const updateProgramSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, "Name is required"),
});
