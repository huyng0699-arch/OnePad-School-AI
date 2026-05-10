-- CreateTable
CREATE TABLE "AiKeyCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "encryptedApiKey" TEXT NOT NULL,
    "maskedKey" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastUsedAt" DATETIME,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "tokenEstimate" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "AuthoringProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "rawInput" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "aiKeyScope" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StructuredLessonRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authoringProjectId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "structuredJson" TEXT NOT NULL,
    "teacherGuideJson" TEXT,
    "quizSeedJson" TEXT,
    "rubricJson" TEXT,
    "adaptiveVersionsJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PublishedLesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "structuredLessonId" TEXT NOT NULL,
    "classId" TEXT,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "publishedByTeacherId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AiAuthoringUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "keyScope" TEXT NOT NULL,
    "keyId" TEXT,
    "modelId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER,
    "tokenEstimate" INTEGER,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AiKeyCredential_keyId_key" ON "AiKeyCredential"("keyId");
