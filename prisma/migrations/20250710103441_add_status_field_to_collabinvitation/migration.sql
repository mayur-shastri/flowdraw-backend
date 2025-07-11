-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "CollabInvitation" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';
