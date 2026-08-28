CREATE TABLE "apartments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "apartments_society_id_name_uq" UNIQUE("society_id","name")
);
--> statement-breakpoint
CREATE TABLE "flats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"apartment_id" uuid NOT NULL,
	"flat_number" varchar(20) NOT NULL,
	"floor" integer,
	"type" varchar(20),
	"area_sqft" integer,
	"owner_id" uuid,
	"tenant_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "flats_apartment_id_flat_number_uq" UNIQUE("apartment_id","flat_number")
);
--> statement-breakpoint
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flats" ADD CONSTRAINT "flats_apartment_id_apartments_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flats" ADD CONSTRAINT "flats_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flats" ADD CONSTRAINT "flats_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "apartments_society_id_ix" ON "apartments" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "flats_apartment_id_ix" ON "flats" USING btree ("apartment_id");--> statement-breakpoint
CREATE INDEX "flats_owner_id_ix" ON "flats" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "flats_tenant_id_ix" ON "flats" USING btree ("tenant_id");