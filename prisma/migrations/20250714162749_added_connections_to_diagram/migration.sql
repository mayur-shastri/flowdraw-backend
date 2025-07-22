/*
  Warnings:

  - Added the required column `connections` to the `Diagram` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Diagram" ADD COLUMN     "connections" JSONB NOT NULL;
