-- AlterTable
ALTER TABLE "AgentRun" ADD COLUMN "error" TEXT;
ALTER TABLE "AgentRun" ADD COLUMN "finishedAt" DATETIME;
ALTER TABLE "AgentRun" ADD COLUMN "startedAt" DATETIME;
ALTER TABLE "AgentRun" ADD COLUMN "workflowInstanceId" TEXT;

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExecBoard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Executive Board',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExecBoard_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExecBoardMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "userId" TEXT,
    "agentId" TEXT,
    "title" TEXT,
    "since" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ExecBoardMember_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "ExecBoard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExecBoardMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ExecBoardMember_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AIAgent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entityRef" TEXT,
    "role" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgentAssignment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AIAgent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExecDecisionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "userId" TEXT,
    "agentId" TEXT,
    "topic" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "rationale" JSONB,
    "target" TEXT,
    "tags" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExecDecisionLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExecDecisionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ExecDecisionLog_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AIAgent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIAgent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "visibility" TEXT NOT NULL DEFAULT 'TENANT',
    "tenantId" TEXT,
    "ownerUserId" TEXT,
    "capabilities" JSONB NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIAgent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AIAgent_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AIAgent" ("capabilities", "createdAt", "id", "key", "name", "status", "updatedAt", "visibility") SELECT "capabilities", "createdAt", "id", "key", "name", "status", "updatedAt", "visibility" FROM "AIAgent";
DROP TABLE "AIAgent";
ALTER TABLE "new_AIAgent" RENAME TO "AIAgent";
CREATE UNIQUE INDEX "AIAgent_key_key" ON "AIAgent"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ExecBoard_tenantId_idx" ON "ExecBoard"("tenantId");

-- CreateIndex
CREATE INDEX "ExecBoardMember_boardId_active_idx" ON "ExecBoardMember"("boardId", "active");

-- CreateIndex
CREATE INDEX "ExecBoardMember_userId_idx" ON "ExecBoardMember"("userId");

-- CreateIndex
CREATE INDEX "ExecBoardMember_agentId_idx" ON "ExecBoardMember"("agentId");

-- CreateIndex
CREATE INDEX "AgentAssignment_agentId_module_active_idx" ON "AgentAssignment"("agentId", "module", "active");

-- CreateIndex
CREATE INDEX "AgentAssignment_entityRef_idx" ON "AgentAssignment"("entityRef");

-- CreateIndex
CREATE INDEX "ExecDecisionLog_tenantId_createdAt_idx" ON "ExecDecisionLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ExecDecisionLog_userId_idx" ON "ExecDecisionLog"("userId");

-- CreateIndex
CREATE INDEX "ExecDecisionLog_agentId_idx" ON "ExecDecisionLog"("agentId");

-- CreateIndex
CREATE INDEX "AgentRun_agentId_status_createdAt_idx" ON "AgentRun"("agentId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AgentRun_workflowInstanceId_idx" ON "AgentRun"("workflowInstanceId");
