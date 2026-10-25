-- DropIndex
DROP INDEX `colis_agence_livraison_id_fkey` ON `colis`;

-- DropIndex
DROP INDEX `colis_agence_ramassage_id_fkey` ON `colis`;

-- DropIndex
DROP INDEX `colis_livreur_livraison_id_fkey` ON `colis`;

-- DropIndex
DROP INDEX `colis_livreur_ramassage_id_fkey` ON `colis`;

-- AlterTable
ALTER TABLE `colis` ADD COLUMN `expedition_id` CHAR(36) NULL,
    ADD COLUMN `expedition_livreur_id` CHAR(36) NULL,
    ADD COLUMN `ramassage_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `colis_events` ADD COLUMN `created_by_account_id` CHAR(36) NULL;

-- CreateTable
CREATE TABLE `settings` (
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ramassages` (
    `id` CHAR(36) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `agence_id` CHAR(36) NOT NULL,
    `livreur_id` CHAR(36) NOT NULL,
    `statut` ENUM('PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE') NOT NULL DEFAULT 'PLANIFIE',
    `scheduled_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ramassages_reference_key`(`reference`),
    INDEX `ramassages_agence_id_idx`(`agence_id`),
    INDEX `ramassages_livreur_id_idx`(`livreur_id`),
    INDEX `ramassages_statut_idx`(`statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expeditions` (
    `id` CHAR(36) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `agence_source_id` CHAR(36) NOT NULL,
    `agence_dest_id` CHAR(36) NOT NULL,
    `statut` ENUM('NOUVEAU', 'EN_TRANSIT', 'RECEPTIONNE', 'ANNULE') NOT NULL DEFAULT 'NOUVEAU',
    `sent_at` DATETIME(3) NULL,
    `received_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `expeditions_reference_key`(`reference`),
    INDEX `expeditions_agence_source_id_idx`(`agence_source_id`),
    INDEX `expeditions_agence_dest_id_idx`(`agence_dest_id`),
    INDEX `expeditions_statut_idx`(`statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expeditions_livreur` (
    `id` CHAR(36) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `agence_id` CHAR(36) NOT NULL,
    `livreur_id` CHAR(36) NOT NULL,
    `statut` ENUM('NOUVEAU', 'RECEPTIONNE', 'EN_COURS', 'TERMINE', 'ANNULE') NOT NULL DEFAULT 'NOUVEAU',
    `dispatched_at` DATETIME(3) NULL,
    `received_by_livreur_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `expeditions_livreur_reference_key`(`reference`),
    INDEX `expeditions_livreur_agence_id_idx`(`agence_id`),
    INDEX `expeditions_livreur_livreur_id_idx`(`livreur_id`),
    INDEX `expeditions_livreur_statut_idx`(`statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `factures_livreur` (
    `id` CHAR(36) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `livreur_id` CHAR(36) NOT NULL,
    `agence_id` CHAR(36) NOT NULL,
    `periode_start` DATETIME(3) NULL,
    `periode_end` DATETIME(3) NULL,
    `montant_collecte` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `tarif_total` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `commission_livreur` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `montant_a_verser_agence` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `statut` ENUM('EN_ATTENTE', 'MONTANT_VERSE', 'PAYE') NOT NULL DEFAULT 'EN_ATTENTE',
    `piece_jointe_url` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_by_account_id` CHAR(36) NULL,
    `paid_by_account_id` CHAR(36) NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `factures_livreur_reference_key`(`reference`),
    INDEX `factures_livreur_livreur_id_idx`(`livreur_id`),
    INDEX `factures_livreur_agence_id_idx`(`agence_id`),
    INDEX `factures_livreur_statut_idx`(`statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `factures_livreur_lignes` (
    `id` CHAR(36) NOT NULL,
    `facture_id` CHAR(36) NOT NULL,
    `colis_id` CHAR(36) NOT NULL,
    `montant_collecte` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `tarif` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `commission` DECIMAL(12, 2) NOT NULL DEFAULT 0,

    INDEX `factures_livreur_lignes_facture_id_idx`(`facture_id`),
    UNIQUE INDEX `factures_livreur_lignes_colis_id_key`(`colis_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `factures_client` (
    `id` CHAR(36) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `client_id` CHAR(36) NOT NULL,
    `montant_colis_total` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `montant_tarif_total` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `montant_net` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `statut` ENUM('EN_ATTENTE', 'MONTANT_VERSE', 'PAYE') NOT NULL DEFAULT 'EN_ATTENTE',
    `piece_jointe_url` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_by_account_id` CHAR(36) NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `factures_client_reference_key`(`reference`),
    INDEX `factures_client_client_id_idx`(`client_id`),
    INDEX `factures_client_statut_idx`(`statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `factures_client_lignes` (
    `id` CHAR(36) NOT NULL,
    `facture_id` CHAR(36) NOT NULL,
    `colis_id` CHAR(36) NOT NULL,
    `montant_collecte` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `tarif` DECIMAL(12, 2) NOT NULL DEFAULT 0,

    INDEX `factures_client_lignes_facture_id_idx`(`facture_id`),
    INDEX `factures_client_lignes_colis_id_idx`(`colis_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `colis_ramassage_id_idx` ON `colis`(`ramassage_id`);

-- CreateIndex
CREATE INDEX `colis_expedition_id_idx` ON `colis`(`expedition_id`);

-- CreateIndex
CREATE INDEX `colis_expedition_livreur_id_idx` ON `colis`(`expedition_livreur_id`);

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
ALTER TABLE `colis` ADD CONSTRAINT `colis_ramassage_id_fkey` FOREIGN KEY (`ramassage_id`) REFERENCES `ramassages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis` ADD CONSTRAINT `colis_expedition_id_fkey` FOREIGN KEY (`expedition_id`) REFERENCES `expeditions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis` ADD CONSTRAINT `colis_expedition_livreur_id_fkey` FOREIGN KEY (`expedition_livreur_id`) REFERENCES `expeditions_livreur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis_events` ADD CONSTRAINT `colis_events_colis_id_fkey` FOREIGN KEY (`colis_id`) REFERENCES `colis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colis_events` ADD CONSTRAINT `colis_events_created_by_account_id_fkey` FOREIGN KEY (`created_by_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ramassages` ADD CONSTRAINT `ramassages_agence_id_fkey` FOREIGN KEY (`agence_id`) REFERENCES `agences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ramassages` ADD CONSTRAINT `ramassages_livreur_id_fkey` FOREIGN KEY (`livreur_id`) REFERENCES `livreurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expeditions` ADD CONSTRAINT `expeditions_agence_source_id_fkey` FOREIGN KEY (`agence_source_id`) REFERENCES `agences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expeditions` ADD CONSTRAINT `expeditions_agence_dest_id_fkey` FOREIGN KEY (`agence_dest_id`) REFERENCES `agences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expeditions_livreur` ADD CONSTRAINT `expeditions_livreur_agence_id_fkey` FOREIGN KEY (`agence_id`) REFERENCES `agences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expeditions_livreur` ADD CONSTRAINT `expeditions_livreur_livreur_id_fkey` FOREIGN KEY (`livreur_id`) REFERENCES `livreurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
