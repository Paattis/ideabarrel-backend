/*
  Warnings:

  - You are about to drop the `group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ideagroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ideagroup` DROP FOREIGN KEY `IdeaGroup_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `ideagroup` DROP FOREIGN KEY `IdeaGroup_idea_id_fkey`;

-- DropTable
DROP TABLE `group`;

-- DropTable
DROP TABLE `ideagroup`;

-- CreateTable
CREATE TABLE `IdeaTag` (
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `idea_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    PRIMARY KEY (`idea_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `IdeaTag` ADD CONSTRAINT `IdeaTag_idea_id_fkey` FOREIGN KEY (`idea_id`) REFERENCES `Idea`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IdeaTag` ADD CONSTRAINT `IdeaTag_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
