-- DropForeignKey
ALTER TABLE "Collaboration" DROP CONSTRAINT "Collaboration_diagramId_fkey";

-- DropForeignKey
ALTER TABLE "Collaboration" DROP CONSTRAINT "Collaboration_userId_fkey";

-- DropForeignKey
ALTER TABLE "ViewOnlyCollaboration" DROP CONSTRAINT "ViewOnlyCollaboration_diagramId_fkey";

-- DropForeignKey
ALTER TABLE "ViewOnlyCollaboration" DROP CONSTRAINT "ViewOnlyCollaboration_userId_fkey";

-- CreateTable
CREATE TABLE "CollabInvitation" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollabInvitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewOnlyCollaboration" ADD CONSTRAINT "ViewOnlyCollaboration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewOnlyCollaboration" ADD CONSTRAINT "ViewOnlyCollaboration_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
