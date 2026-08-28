CREATE TABLE "parking_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"slot_number" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parking_slots_society_id_slot_number_uq" UNIQUE("society_id","slot_number")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"registration_number" varchar(20) NOT NULL,
	"type" varchar(20) NOT NULL,
	"make" varchar(40),
	"model" varchar(40),
	"color" varchar(30),
	"parking_slot_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_registration_number_uq" UNIQUE("registration_number"),
	CONSTRAINT "vehicles_parking_slot_id_uq" UNIQUE("parking_slot_id")
);
--> statement-breakpoint
ALTER TABLE "parking_slots" ADD CONSTRAINT "parking_slots_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_parking_slot_id_parking_slots_id_fk" FOREIGN KEY ("parking_slot_id") REFERENCES "public"."parking_slots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "parking_slots_society_id_ix" ON "parking_slots" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "vehicles_user_id_ix" ON "vehicles" USING btree ("user_id");