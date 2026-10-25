-- DropIndex
DROP INDEX `factures_client_lignes_colis_id_idx` ON `factures_client_lignes`;

-- CreateIndex
CREATE UNIQUE INDEX `factures_client_lignes_colis_id_key` ON `factures_client_lignes`(`colis_id`);
