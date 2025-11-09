-- SMSME migration SQL (generated in-process)
CREATE TABLE "Profile" (
  "id" integer NOT NULL,
  "bio" text
);
ALTER TABLE "User" ADD COLUMN "profileId" integer;