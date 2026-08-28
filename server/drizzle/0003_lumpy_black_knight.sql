CREATE TABLE "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"ticket_number" varchar(20) NOT NULL,
	"raised_by" uuid,
	"assigned_to" uuid,
	"title" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"priority" varchar(20),
	"flat_id" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "complaints_society_id_ticket_number_uq" UNIQUE("society_id","ticket_number")
);
--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_raised_by_users_id_fk" FOREIGN KEY ("raised_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_flat_id_flats_id_fk" FOREIGN KEY ("flat_id") REFERENCES "public"."flats"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "complaints_society_id_ix" ON "complaints" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "complaints_raised_by_ix" ON "complaints" USING btree ("raised_by");--> statement-breakpoint
CREATE INDEX "complaints_assigned_to_ix" ON "complaints" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "complaints_status_ix" ON "complaints" USING btree ("status");