-- CreateTable
CREATE TABLE `factures_agence` (
    `id` CHAR(36) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `agence_id` CHAR(36) NOT NULL,
    `periode_start` DATETIME(3) NULL,
    `periode_end` DATETIME(3) NULL,
    `montant_tarif_total` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `commission_agence` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `statut` ENUM('EN_ATTENTE', 'MONTANT_VERSE', 'PAYE') NOT NULL DEFAULT 'EN_ATTENTE',
    `piece_jointe_url` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_by_account_id` CHAR(36) NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `factures_agence_reference_key`(`reference`),
    INDEX `factures_agence_agence_id_idx`(`agence_id`),
    INDEX `factures_agence_statut_idx`(`statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `factures_agence_lignes` (
    `id` CHAR(36) NOT NULL,
    `facture_id` CHAR(36) NOT NULL,
    `colis_id` CHAR(36) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'SOURCE',
    `tarif` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `commission` DECIMAL(12, 2) NOT NULL DEFAULT 0,

    INDEX `factures_agence_lignes_facture_id_idx`(`facture_id`),
    INDEX `factures_agence_lignes_colis_id_idx`(`colis_id`),
    UNIQUE INDEX `factures_agence_lignes_facture_id_colis_id_key`(`facture_id`, `colis_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `factures_agence` ADD CONSTRAINT `factures_agence_agence_id_fkey` FOREIGN KEY (`agence_id`) REFERENCES `agences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_agence` ADD CONSTRAINT `factures_agence_created_by_account_id_fkey` FOREIGN KEY (`created_by_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_agence_lignes` ADD CONSTRAINT `factures_agence_lignes_facture_id_fkey` FOREIGN KEY (`facture_id`) REFERENCES `factures_agence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_agence_lignes` ADD CONSTRAINT `factures_agence_lignes_colis_id_fkey` FOREIGN KEY (`colis_id`) REFERENCES `colis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
