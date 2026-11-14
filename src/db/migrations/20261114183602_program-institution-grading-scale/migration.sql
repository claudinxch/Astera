CREATE TYPE "grading_scale" AS ENUM('percent', 'ten', 'letter_us');--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "institution" text;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "grading_scale" "grading_scale" DEFAULT 'percent'::"grading_scale" NOT NULL;