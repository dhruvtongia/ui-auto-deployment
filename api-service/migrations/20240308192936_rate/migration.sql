-- CreateTable
CREATE TABLE "CurrentDeploymentLimiter" (
    "Id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CurrentDeploymentLimiter_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrentDeploymentLimiter_userId_key" ON "CurrentDeploymentLimiter"("userId");
