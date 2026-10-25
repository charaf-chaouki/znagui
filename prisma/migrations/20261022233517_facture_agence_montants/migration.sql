-- AlterTable: facture agence settlement amounts
ALTER TABLE `factures_agence`
    ADD COLUMN `montant_collecte` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `montant_a_verser` DECIMAL(14, 2) NOT NULL DEFAULT 0;

-- AlterTable: per-colis collected amount and amount to remit
ALTER TABLE `factures_agence_lignes`
    ADD COLUMN `collecte` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `montant_a_verser` DECIMAL(12, 2) NOT NULL DEFAULT 0;
