CREATE TABLE `bc_dados_linha` (
	`id` int AUTO_INCREMENT NOT NULL,
	`importacaoId` int NOT NULL,
	`dataBase` varchar(7) NOT NULL,
	`baseOrigem` enum('consolidados','dados_uf') NOT NULL,
	`tipoDados` varchar(100) NOT NULL,
	`nomeArquivoOriginal` varchar(255) NOT NULL,
	`cnpjAdministradora` varchar(20) NOT NULL,
	`nomeAdministradora` varchar(255) NOT NULL,
	`codigoSegmento` varchar(10) NOT NULL,
	`dadosLinha` text NOT NULL,
	`cabecalhosOriginais` text,
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bc_dados_linha_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `bc_dados_mensais`;