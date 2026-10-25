/*
  Warnings:

  - You are about to drop the column `expedition_id` on the `colis` table. All the data in the column will be lost.
  - You are about to drop the column `expedition_livreur_id` on the `colis` table. All the data in the column will be lost.
  - You are about to drop the column `ramassage_id` on the `colis` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `colis_agence_livraison_id_fkey` ON `colis`;

-- DropIndex
DROP INDEX `colis_agence_ramassage_id_fkey` ON `colis`;

-- DropIndex
DROP INDEX `colis_expedition_id_idx` ON `colis`;

-- DropIndex
DROP INDEX `colis_expedition_livreur_id_idx` ON `colis`;

-- DropIndex
DROP INDEX `colis_livreur_livraison_id_fkey` ON `colis`;

-- DropIndex
DROP INDEX `colis_livreur_ramassage_id_fkey` ON `colis`;

-- DropIndex
DROP INDEX `colis_ramassage_id_idx` ON `colis`;

-- DropIndex
DROP INDEX `colis_events_created_by_account_id_fkey` ON `colis_events`;

-- DropIndex
DROP INDEX `factures_client_created_by_account_id_fkey` ON `factures_client`;

-- DropIndex
DROP INDEX `factures_livreur_created_by_account_id_fkey` ON `factures_livreur`;

-- DropIndex
DROP INDEX `factures_livreur_paid_by_account_id_fkey` ON `factures_livreur`;

-- AlterTable
ALTER TABLE `colis` DROP COLUMN `expedition_id`,
    DROP COLUMN `expedition_livreur_id`,
    DROP COLUMN `ramassage_id`;

-- CreateTable
CREATE TABLE `ramassage_lignes` (
    `id` CHAR(36) NOT NULL,
    `ramassage_id` CHAR(36) NOT NULL,
    `colis_id` CHAR(36) NOT NULL,
    `statut` ENUM('EN_ATTENTE', 'CONFIRME', 'MANQUANT') NOT NULL DEFAULT 'EN_ATTENTE',
    `scanned_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ramassage_lignes_colis_id_idx`(`colis_id`),
    UNIQUE INDEX `ramassage_lignes_ramassage_id_colis_id_key`(`ramassage_id`, `colis_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expedition_lignes` (
    `id` CHAR(36) NOT NULL,
    `expedition_id` CHAR(36) NOT NULL,
    `colis_id` CHAR(36) NOT NULL,
    `statut` ENUM('EN_ATTENTE', 'CONFIRME', 'MANQUANT') NOT NULL DEFAULT 'EN_ATTENTE',
    `received_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `expedition_lignes_colis_id_idx`(`colis_id`),
    UNIQUE INDEX `expedition_lignes_expedition_id_colis_id_key`(`expedition_id`, `colis_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expedition_livreur_lignes` (
    `id` CHAR(36) NOT NULL,
    `expedition_livreur_id` CHAR(36) NOT NULL,
    `colis_id` CHAR(36) NOT NULL,
    `statut` ENUM('EN_ATTENTE', 'CONFIRME', 'MANQUANT') NOT NULL DEFAULT 'EN_ATTENTE',
    `received_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `expedition_livreur_lignes_colis_id_idx`(`colis_id`),
    UNIQUE INDEX `expedition_livreur_lignes_expedition_livreur_id_colis_id_key`(`expedition_livreur_id`, `colis_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `agences` ADD CONSTRAINT `agences_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agences` ADD CONSTRAINT `agences_ville_id_fkey` FOREIGN KEY (`ville_id`) REFERENCES `villes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `livreurs` ADD CONSTRAINT `livreurs_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `livreurs` ADD CONSTRAINT `livreurs_agence_id_fkey` FOREIGN KEY (`agence_id`) REFERENCES `agences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `livreurs` ADD CONSTRAINT `livreurs_ville_id_fkey` FOREIGN KEY (`ville_id`) REFERENCES `villes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clients` ADD CONSTRAINT `clients_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clients` ADD CONSTRAINT `clients_ville_id_fkey` FOREIGN KEY (`ville_id`) REFERENCES `villes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis` ADD CONSTRAINT `colis_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis` ADD CONSTRAINT `colis_pickup_ville_id_fkey` FOREIGN KEY (`pickup_ville_id`) REFERENCES `villes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis` ADD CONSTRAINT `colis_destination_ville_id_fkey` FOREIGN KEY (`destination_ville_id`) REFERENCES `villes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis` ADD CONSTRAINT `colis_agence_ramassage_id_fkey` FOREIGN KEY (`agence_ramassage_id`) REFERENCES `agences`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis` ADD CONSTRAINT `colis_agence_livraison_id_fkey` FOREIGN KEY (`agence_livraison_id`) REFERENCES `agences`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis` ADD CONSTRAINT `colis_livreur_ramassage_id_fkey` FOREIGN KEY (`livreur_ramassage_id`) REFERENCES `livreurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis` ADD CONSTRAINT `colis_livreur_livraison_id_fkey` FOREIGN KEY (`livreur_livraison_id`) REFERENCES `livreurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis_events` ADD CONSTRAINT `colis_events_colis_id_fkey` FOREIGN KEY (`colis_id`) REFERENCES `colis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis_events` ADD CONSTRAINT `colis_events_created_by_account_id_fkey` FOREIGN KEY (`created_by_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ramassages` ADD CONSTRAINT `ramassages_agence_id_fkey` FOREIGN KEY (`agence_id`) REFERENCES `agences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ramassages` ADD CONSTRAINT `ramassages_livreur_id_fkey` FOREIGN KEY (`livreur_id`) REFERENCES `livreurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ramassage_lignes` ADD CONSTRAINT `ramassage_lignes_ramassage_id_fkey` FOREIGN KEY (`ramassage_id`) REFERENCES `ramassages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ramassage_lignes` ADD CONSTRAINT `ramassage_lignes_colis_id_fkey` FOREIGN KEY (`colis_id`) REFERENCES `colis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expeditions` ADD CONSTRAINT `expeditions_agence_source_id_fkey` FOREIGN KEY (`agence_source_id`) REFERENCES `agences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expeditions` ADD CONSTRAINT `expeditions_agence_dest_id_fkey` FOREIGN KEY (`agence_dest_id`) REFERENCES `agences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expedition_lignes` ADD CONSTRAINT `expedition_lignes_expedition_id_fkey` FOREIGN KEY (`expedition_id`) REFERENCES `expeditions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expedition_lignes` ADD CONSTRAINT `expedition_lignes_colis_id_fkey` FOREIGN KEY (`colis_id`) REFERENCES `colis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expeditions_livreur` ADD CONSTRAINT `expeditions_livreur_agence_id_fkey` FOREIGN KEY (`agence_id`) REFERENCES `agences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expeditions_livreur` ADD CONSTRAINT `expeditions_livreur_livreur_id_fkey` FOREIGN KEY (`livreur_id`) REFERENCES `livreurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expedition_livreur_lignes` ADD CONSTRAINT `expedition_livreur_lignes_expedition_livreur_id_fkey` FOREIGN KEY (`expedition_livreur_id`) REFERENCES `expeditions_livreur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expedition_livreur_lignes` ADD CONSTRAINT `expedition_livreur_lignes_colis_id_fkey` FOREIGN KEY (`colis_id`) REFERENCES `colis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_livreur` ADD CONSTRAINT `factures_livreur_livreur_id_fkey` FOREIGN KEY (`livreur_id`) REFERENCES `livreurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_livreur` ADD CONSTRAINT `factures_livreur_agence_id_fkey` FOREIGN KEY (`agence_id`) REFERENCES `agences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_livreur` ADD CONSTRAINT `factures_livreur_created_by_account_id_fkey` FOREIGN KEY (`created_by_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_livreur` ADD CONSTRAINT `factures_livreur_paid_by_account_id_fkey` FOREIGN KEY (`paid_by_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_livreur_lignes` ADD CONSTRAINT `factures_livreur_lignes_facture_id_fkey` FOREIGN KEY (`facture_id`) REFERENCES `factures_livreur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_livreur_lignes` ADD CONSTRAINT `factures_livreur_lignes_colis_id_fkey` FOREIGN KEY (`colis_id`) REFERENCES `colis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_client` ADD CONSTRAINT `factures_client_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_client` ADD CONSTRAINT `factures_client_created_by_account_id_fkey` FOREIGN KEY (`created_by_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_client_lignes` ADD CONSTRAINT `factures_client_lignes_facture_id_fkey` FOREIGN KEY (`facture_id`) REFERENCES `factures_client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_client_lignes` ADD CONSTRAINT `factures_client_lignes_colis_id_fkey` FOREIGN KEY (`colis_id`) REFERENCES `colis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
