-- CreateTable
CREATE TABLE "AiBusinessAdvice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relatedPeriodType" TEXT,
    "relatedEntityId" TEXT,

    CONSTRAINT "AiBusinessAdvice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiBusinessAdvice" ADD CONSTRAINT "AiBusinessAdvice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
