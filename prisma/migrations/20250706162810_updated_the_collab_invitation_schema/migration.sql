-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('VIEW', 'EDIT');

-- AlterTable
ALTER TABLE "CollabInvitation" ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL DEFAULT 'VIEW';
