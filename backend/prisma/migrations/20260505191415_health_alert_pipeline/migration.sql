-- CreateTable
CREATE TABLE "PhoneHealthMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "sourceApp" TEXT NOT NULL,
    "capturedAt" DATETIME NOT NULL,
    "steps" INTEGER,
    "activeMinutes" INTEGER,
    "sleepMinutes" INTEGER,
    "restingHeartRate" INTEGER,
    "hrv" REAL,
    "bloodOxygen" REAL,
    "metadataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChildHealthAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "trendWindowDays" INTEGER NOT NULL,
    "triggeredSignalsJson" TEXT NOT NULL,
    "safeSummary" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME
);
