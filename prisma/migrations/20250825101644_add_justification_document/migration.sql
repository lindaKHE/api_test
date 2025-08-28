-- CreateTable
CREATE TABLE `JustificationDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderArticleId` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `status` ENUM('A_VALIDER', 'VALIDE', 'REFUSE') NOT NULL DEFAULT 'A_VALIDER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `JustificationDocument_orderArticleId_key`(`orderArticleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JustificationDocument` ADD CONSTRAINT `JustificationDocument_orderArticleId_fkey` FOREIGN KEY (`orderArticleId`) REFERENCES `OrderArticle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
