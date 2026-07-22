CREATE TABLE `bc_arquivos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`importacaoId` int NOT NULL,
	`nomeArquivo` varchar(255) NOT NULL,
	`tipoArquivo` varchar(10) NOT NULL,
	`dataBase` varchar(7) NOT NULL,
	`caminhoArmazenado` text NOT NULL,
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bc_arquivos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bc_dados_mensais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`importacaoId` int NOT NULL,
	`dataBase` varchar(7) NOT NULL,
	`tipoDados` varchar(100) NOT NULL,
	`dadosJson` text NOT NULL,
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bc_dados_mensais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bc_importacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dataImportacao` timestamp NOT NULL DEFAULT (now()),
	`dataBase` varchar(7) NOT NULL,
	`nomeZip` varchar(255) NOT NULL,
	`hashArquivo` varchar(64) NOT NULL,
	`status` enum('pendente','sucesso','erro') NOT NULL DEFAULT 'pendente',
	`quantidadeArquivosExtraidos` int DEFAULT 0,
	`logs` text,
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	`atualizadoEm` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bc_importacoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `bc_importacoes_nomeZip_unique` UNIQUE(`nomeZip`),
	CONSTRAINT `bc_importacoes_hashArquivo_unique` UNIQUE(`hashArquivo`)
);
