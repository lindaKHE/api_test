-- CreateTable
CREATE TABLE `profile` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `profile_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_UserProfiles` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_UserProfiles_AB_unique`(`A`, `B`),
    INDEX `_UserProfiles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_UserProfiles` ADD CONSTRAINT `_UserProfiles_A_fkey` FOREIGN KEY (`A`) REFERENCES `profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserProfiles` ADD CONSTRAINT `_UserProfiles_B_fkey` FOREIGN KEY (`B`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
