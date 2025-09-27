/*
  Warnings:

  - You are about to drop the column `profilePublicInfo` on the `participants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "participants" DROP COLUMN "profilePublicInfo";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profilePublicInfo" TEXT;
