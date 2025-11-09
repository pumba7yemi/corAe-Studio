/*
  Warnings:

  - You are about to drop the `CimsMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LearnedMemory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemoryInstall` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemoryOverride` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemoryPack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemoryPackItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemoryTenant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemoryVendor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkfocusTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `caia_memory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CimsMessage";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LearnedMemory";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MemoryInstall";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MemoryOverride";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MemoryPack";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MemoryPackItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MemoryTenant";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MemoryVendor";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorkfocusTask";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "caia_memory";
PRAGMA foreign_keys=on;
