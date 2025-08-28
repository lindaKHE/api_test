/*
  Warnings:

  - You are about to drop the `_UserProfiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_UserProfiles` DROP FOREIGN KEY `_UserProfiles_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserProfiles` DROP FOREIGN KEY `_UserProfiles_B_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `parentId` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('ADMIN', 'PARENT', 'CHILD') NOT NULL DEFAULT 'CHILD';

-- DropTable
DROP TABLE `_UserProfiles`;

-- CreateTable
CREATE TABLE `_ProfileToUser` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ProfileToUser_AB_unique`(`A`, `B`),
    INDEX `_ProfileToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProfileToUser` ADD CONSTRAINT `_ProfileToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProfileToUser` ADD CONSTRAINT `_ProfileToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
