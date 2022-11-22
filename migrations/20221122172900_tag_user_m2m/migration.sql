-- CreateTable
CREATE TABLE `TagUser` (
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TagUser` ADD CONSTRAINT `TagUser_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TagUser` ADD CONSTRAINT `TagUser_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
