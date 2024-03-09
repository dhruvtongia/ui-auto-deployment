/*
  Warnings:

  - A unique constraint covering the columns `[projectId]` on the table `Deployment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('PENDING', 'DEPLOYED');

-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN     "status" "DeploymentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "Deployment_projectId_key" ON "Deployment"("projectId");
