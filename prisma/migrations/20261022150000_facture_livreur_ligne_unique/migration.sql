-- Allow a colis to be billed to more than one livreur facture (inter-villes:
-- ramasseur in ville X + livreur in ville Y). Replace the per-colis unique with
-- a per-(facture, colis) unique, keeping an index + FK on colis_id.

ALTER TABLE `factures_livreur_lignes` DROP FOREIGN KEY `factures_livreur_lignes_colis_id_fkey`;
DROP INDEX `factures_livreur_lignes_colis_id_key` ON `factures_livreur_lignes`;
CREATE INDEX `factures_livreur_lignes_colis_id_idx` ON `factures_livreur_lignes`(`colis_id`);
CREATE UNIQUE INDEX `factures_livreur_lignes_facture_id_colis_id_key` ON `factures_livreur_lignes`(`facture_id`, `colis_id`);
ALTER TABLE `factures_livreur_lignes` ADD CONSTRAINT `factures_livreur_lignes_colis_id_fkey` FOREIGN KEY (`colis_id`) REFERENCES `colis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
