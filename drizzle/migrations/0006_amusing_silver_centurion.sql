CREATE TABLE "competition_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"name" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "competitions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "solve_script" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "competition_id" uuid;