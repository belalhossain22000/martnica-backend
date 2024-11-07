/*
  Warnings:

  - A unique constraint covering the columns `[facebookId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Users` ADD COLUMN `facebookId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Users_facebookId_key` ON `Users`(`facebookId`);
