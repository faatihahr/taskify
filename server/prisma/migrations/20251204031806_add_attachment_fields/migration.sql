/*
  Warnings:

  - The primary key for the `_CardToLabel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `size` on the `attachments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[A,B]` on the table `_CardToLabel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uploadedById` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "_CardToLabel" DROP CONSTRAINT "_CardToLabel_AB_pkey";

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "size",
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "uploadedById" TEXT NOT NULL,
ALTER COLUMN "url" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "_CardToLabel_AB_unique" ON "_CardToLabel"("A", "B");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
