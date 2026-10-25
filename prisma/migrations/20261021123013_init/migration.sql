-- CreateTable
CREATE TABLE `accounts` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'AGENCE', 'LIVREUR', 'CLIENT') NOT NULL DEFAULT 'CLIENT',
    `status` ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `accounts_email_key`(`email`),
    UNIQUE INDEX `accounts_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `villes` (
    `id` CHAR(36) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `villes_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agences` (
    `id` CHAR(36) NOT NULL,
    `account_id` CHAR(36) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `responsable` VARCHAR(191) NOT NULL,
    `ville_id` CHAR(36) NOT NULL,
    `adresse` VARCHAR(191) NULL,
    `telephone` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `location_map` TEXT NULL,
    `status` ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `agences_account_id_key`(`account_id`),
    INDEX `agences_ville_id_idx`(`ville_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `livreurs` (
    `id` CHAR(36) NOT NULL,
    `account_id` CHAR(36) NOT NULL,
    `agence_id` CHAR(36) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `cni` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `ice` VARCHAR(191) NULL,
    `banque` VARCHAR(191) NULL,
    `rib` VARCHAR(191) NULL,
    `cni_recto_file` VARCHAR(191) NULL,
    `cni_verso_file` VARCHAR(191) NULL,
    `rib_file` VARCHAR(191) NULL,
    `ville_id` CHAR(36) NOT NULL,
    `adresse` VARCHAR(191) NULL,
    `status_account` ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `livreurs_account_id_key`(`account_id`),
    INDEX `livreurs_agence_id_idx`(`agence_id`),
    INDEX `livreurs_ville_id_idx`(`ville_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `id` CHAR(36) NOT NULL,
    `account_id` CHAR(36) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `ville_id` CHAR(36) NULL,
    `adresse` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clients_account_id_key`(`account_id`),
    INDEX `clients_ville_id_idx`(`ville_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `colis` (
    `id` CHAR(36) NOT NULL,
    `tracking_number` VARCHAR(191) NOT NULL,
    `client_id` CHAR(36) NOT NULL,
    `type` ENUM('INTRA', 'INTER') NOT NULL,
    `statut` ENUM('CREE', 'DISPONIBLE_A_RAMASSER', 'AFFECTE_RAMASSAGE', 'RAMASSE', 'RECU_ENTREPOT_SOURCE', 'EN_EXPEDITION', 'RECU_PAR_AGENCE_DEST', 'DISPATCHE_LIVREUR', 'EN_COURS_DE_LIVRAISON', 'LIVRE', 'RETOUR', 'ANNULE') NOT NULL DEFAULT 'CREE',
    `pickup_ville_id` CHAR(36) NOT NULL,
    `pickup_address` TEXT NOT NULL,
    `pickup_lat` DOUBLE NULL,
    `pickup_lng` DOUBLE NULL,
    `recipient_name` VARCHAR(191) NOT NULL,
    `recipient_phone` VARCHAR(191) NOT NULL,
    `destination_ville_id` CHAR(36) NOT NULL,
    `destination_address` TEXT NOT NULL,
    `destination_map_link` TEXT NULL,
    `notes` TEXT NULL,
    `vehicle_type` ENUM('MOTO', 'VOITURE', 'CAMION') NOT NULL DEFAULT 'MOTO',
    `parcel_count` INTEGER NOT NULL DEFAULT 1,
    `contents` TEXT NOT NULL,
    `amount_to_collect` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `tarif` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `agence_ramassage_id` CHAR(36) NULL,
    `agence_livraison_id` CHAR(36) NULL,
    `livreur_ramassage_id` CHAR(36) NULL,
    `livreur_livraison_id` CHAR(36) NULL,
    `qr_token` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `colis_tracking_number_key`(`tracking_number`),
    UNIQUE INDEX `colis_qr_token_key`(`qr_token`),
    INDEX `colis_client_id_idx`(`client_id`),
    INDEX `colis_statut_idx`(`statut`),
    INDEX `colis_pickup_ville_id_idx`(`pickup_ville_id`),
    INDEX `colis_destination_ville_id_idx`(`destination_ville_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `colis_events` (
    `id` CHAR(36) NOT NULL,
    `colis_id` CHAR(36) NOT NULL,
    `statut` ENUM('CREE', 'DISPONIBLE_A_RAMASSER', 'AFFECTE_RAMASSAGE', 'RAMASSE', 'RECU_ENTREPOT_SOURCE', 'EN_EXPEDITION', 'RECU_PAR_AGENCE_DEST', 'DISPATCHE_LIVREUR', 'EN_COURS_DE_LIVRAISON', 'LIVRE', 'RETOUR', 'ANNULE') NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `colis_events_colis_id_idx`(`colis_id`),
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
