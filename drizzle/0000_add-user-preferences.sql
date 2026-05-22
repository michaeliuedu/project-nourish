ALTER TABLE "users"
	ADD COLUMN IF NOT EXISTS "preferences" text[] DEFAULT '{}' NOT NULL;
