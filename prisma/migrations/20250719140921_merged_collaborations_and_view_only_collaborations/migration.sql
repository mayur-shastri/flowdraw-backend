/*
  Warnings:

  - You are about to drop the `ViewOnlyCollaboration` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `accessLevel` to the `Collaboration` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ViewOnlyCollaboration" DROP CONSTRAINT "ViewOnlyCollaboration_diagramId_fkey";

-- DropForeignKey
ALTER TABLE "ViewOnlyCollaboration" DROP CONSTRAINT "ViewOnlyCollaboration_userId_fkey";

-- AlterTable
ALTER TABLE "Collaboration" ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL;

-- DropTable
DROP TABLE "ViewOnlyCollaboration";
