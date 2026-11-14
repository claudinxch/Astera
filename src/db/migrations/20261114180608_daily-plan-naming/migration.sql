ALTER TYPE "assignment_type" RENAME VALUE 'quiz' TO 'test';--> statement-breakpoint
ALTER TABLE "recommendation_items" RENAME TO "daily_plan_items";--> statement-breakpoint
ALTER TABLE "daily_recommendations" RENAME TO "daily_plans";--> statement-breakpoint
ALTER TABLE "daily_plan_items" RENAME COLUMN "daily_recommendation_id" TO "daily_plan_id";--> statement-breakpoint
ALTER TABLE "daily_plans" RENAME CONSTRAINT "daily_recommendations_pkey" TO "daily_plans_pkey";--> statement-breakpoint
ALTER TABLE "daily_plan_items" RENAME CONSTRAINT "recommendation_items_pkey" TO "daily_plan_items_pkey";--> statement-breakpoint
ALTER TABLE "daily_plans" RENAME CONSTRAINT "daily_recommendations_user_id_user_id_fk" TO "daily_plans_user_id_user_id_fkey";--> statement-breakpoint
ALTER TABLE "daily_plan_items" RENAME CONSTRAINT "recommendation_items_daily_recommendation_id_daily_recommendati" TO "daily_plan_items_daily_plan_id_daily_plans_id_fkey";--> statement-breakpoint
ALTER TABLE "daily_plan_items" RENAME CONSTRAINT "recommendation_items_assignment_id_assignments_id_fk" TO "daily_plan_items_assignment_id_assignments_id_fkey";--> statement-breakpoint
ALTER TABLE "daily_plan_items" RENAME CONSTRAINT "recommendation_items_exam_id_exams_id_fk" TO "daily_plan_items_exam_id_exams_id_fkey";
