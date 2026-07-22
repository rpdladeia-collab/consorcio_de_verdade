ALTER TABLE `bc_dados_mensais` MODIFY COLUMN `dadosJson` longtext NOT NULL;--> statement-breakpoint
ALTER TABLE `bc_importacoes` MODIFY COLUMN `logs` longtext;--> statement-breakpoint
ALTER TABLE `bc_dados_mensais` ADD `nomeArquivoOriginal` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `bc_dados_mensais` ADD `quantidadeLinhas` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `bc_dados_mensais` ADD `cabecalhosOriginais` text;--> statement-breakpoint
ALTER TABLE `bc_importacoes` ADD `baseOrigem` enum('consolidados','dados_uf') NOT NULL;--> statement-breakpoint
ALTER TABLE `bc_importacoes` ADD `quantidadeLinhasImportadas` int DEFAULT 0;