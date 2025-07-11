/*
  Warnings:

  - You are about to drop the column `collaborators` on the `Diagram` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Diagram" DROP COLUMN "collaborators";

-- CreateTable
CREATE TABLE "Collaboration" (
    "userId" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("userId","diagramId")
);

-- CreateTable
CREATE TABLE "ViewOnlyCollaboration" (
    "userId" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,

    CONSTRAINT "ViewOnlyCollaboration_pkey" PRIMARY KEY ("userId","diagramId")
);

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewOnlyCollaboration" ADD CONSTRAINT "ViewOnlyCollaboration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewOnlyCollaboration" ADD CONSTRAINT "ViewOnlyCollaboration_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
