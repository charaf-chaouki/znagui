-- DropIndex
DROP INDEX `factures_agence_created_by_account_id_fkey` ON `factures_agence`;

-- AlterTable
ALTER TABLE `company` MODIFY `logo` TEXT NOT NULL DEFAULT '',
    MODIFY `adresse` TEXT NOT NULL DEFAULT '',
    MODIFY `facebook` TEXT NOT NULL DEFAULT '',
    MODIFY `instagram` TEXT NOT NULL DEFAULT '',
    MODIFY `linkedin` TEXT NOT NULL DEFAULT '',
    MODIFY `youtube` TEXT NOT NULL DEFAULT '',
    MODIFY `tiktok` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `livreurs` ADD COLUMN `matricule` VARCHAR(191) NULL,
    ADD COLUMN `vehicle_type` ENUM('MOTO', 'VOITURE', 'CAMION') NOT NULL DEFAULT 'MOTO';

-- AddForeignKey
ALTER TABLE `factures_agence` ADD CONSTRAINT `factures_agence_agence_id_fkey` FOREIGN KEY (`agence_id`) REFERENCES `agences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_agence` ADD CONSTRAINT `factures_agence_created_by_account_id_fkey` FOREIGN KEY (`created_by_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_agence_lignes` ADD CONSTRAINT `factures_agence_lignes_facture_id_fkey` FOREIGN KEY (`facture_id`) REFERENCES `factures_agence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures_agence_lignes` ADD CONSTRAINT `factures_agence_lignes_colis_id_fkey` FOREIGN KEY (`colis_id`) REFERENCES `colis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
