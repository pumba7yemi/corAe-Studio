-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'workflow_partner',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CimsMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT,
    "channel" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "body" TEXT,
    "mediaUrl" TEXT,
    "meta" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderUserId" TEXT,
    CONSTRAINT "CimsMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkfocusTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerUserId" TEXT,
    "bucket" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "dueAt" DATETIME,
    "meta" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkfocusTask_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemoryVendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MemoryPack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "signature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemoryPack_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "MemoryVendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemoryPackItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemoryPackItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "MemoryPack" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemoryTenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brandSlug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MemoryInstall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemoryInstall_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "MemoryTenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MemoryInstall_packId_fkey" FOREIGN KEY ("packId") REFERENCES "MemoryPack" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemoryOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "packItemId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemoryOverride_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "MemoryTenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MemoryOverride_packItemId_fkey" FOREIGN KEY ("packItemId") REFERENCES "MemoryPackItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearnedMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "kind" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" DATETIME,
    "expireAt" DATETIME,
    CONSTRAINT "LearnedMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "caia_memory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "CimsMessage_threadId_idx" ON "CimsMessage"("threadId");

-- CreateIndex
CREATE INDEX "CimsMessage_createdAt_idx" ON "CimsMessage"("createdAt");

-- CreateIndex
CREATE INDEX "WorkfocusTask_ownerUserId_idx" ON "WorkfocusTask"("ownerUserId");

-- CreateIndex
CREATE INDEX "WorkfocusTask_bucket_idx" ON "WorkfocusTask"("bucket");

-- CreateIndex
CREATE INDEX "MemoryPack_slug_version_idx" ON "MemoryPack"("slug", "version");

-- CreateIndex
CREATE UNIQUE INDEX "MemoryPack_vendorId_slug_version_key" ON "MemoryPack"("vendorId", "slug", "version");

-- CreateIndex
CREATE INDEX "MemoryPackItem_packId_idx" ON "MemoryPackItem"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "MemoryTenant_brandSlug_key" ON "MemoryTenant"("brandSlug");

-- CreateIndex
CREATE INDEX "MemoryInstall_tenantId_idx" ON "MemoryInstall"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "MemoryInstall_tenantId_packId_key" ON "MemoryInstall"("tenantId", "packId");

-- CreateIndex
CREATE INDEX "MemoryOverride_tenantId_idx" ON "MemoryOverride"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "MemoryOverride_tenantId_packItemId_key" ON "MemoryOverride"("tenantId", "packItemId");

-- CreateIndex
CREATE INDEX "LearnedMemory_tenantId_idx" ON "LearnedMemory"("tenantId");

-- CreateIndex
CREATE INDEX "LearnedMemory_userId_idx" ON "LearnedMemory"("userId");

-- CreateIndex
CREATE INDEX "LearnedMemory_createdAt_idx" ON "LearnedMemory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "caia_memory_scope_key_key" ON "caia_memory"("scope", "key");
