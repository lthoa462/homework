-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HomeworkReport" (
    "id" SERIAL NOT NULL,
    "reportDate" DATE NOT NULL,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeworkReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubjectEntry" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "subjectName" VARCHAR(50) NOT NULL,
    "content" TEXT,
    "imageUrls" TEXT[],
    "isHomework" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SubjectEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Schedule" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "subjectName" VARCHAR(50) NOT NULL,
    "startTime" TIME,
    "endTime" TIME,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."HomeworkReport" ADD CONSTRAINT "HomeworkReport_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectEntry" ADD CONSTRAINT "SubjectEntry_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."HomeworkReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
