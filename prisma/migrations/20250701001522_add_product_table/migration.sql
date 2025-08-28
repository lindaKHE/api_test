-- CreateTable
CREATE TABLE `product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `shortText` VARCHAR(191) NOT NULL,
    `unitPrice` INTEGER NOT NULL,
    `isSaleable` BOOLEAN NOT NULL,
    `picture` VARCHAR(191) NULL,
    `orderMaxQuantity` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProductAllowedProfiles` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ProductAllowedProfiles_AB_unique`(`A`, `B`),
    INDEX `_ProductAllowedProfiles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ProductAllowedProfiles` ADD CONSTRAINT `_ProductAllowedProfiles_A_fkey` FOREIGN KEY (`A`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProductAllowedProfiles` ADD CONSTRAINT `_ProductAllowedProfiles_B_fkey` FOREIGN KEY (`B`) REFERENCES `profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
