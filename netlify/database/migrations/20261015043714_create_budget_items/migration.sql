CREATE TABLE "budget_items" (
	"id" serial PRIMARY KEY,
	"position" integer DEFAULT 0 NOT NULL,
	"item" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'production' NOT NULL,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"start_date" text DEFAULT '' NOT NULL,
	"end_date" text DEFAULT '' NOT NULL,
	"price" double precision DEFAULT 0 NOT NULL,
	"other" double precision DEFAULT 0 NOT NULL,
	"tax" double precision DEFAULT 11 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
