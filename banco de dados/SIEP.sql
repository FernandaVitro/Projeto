-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.32-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para siep
DROP DATABASE IF EXISTS `siep`;
CREATE DATABASE IF NOT EXISTS `siep` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin */;
USE `siep`;

-- Copiando estrutura para tabela siep.cadastro_empresas
DROP TABLE IF EXISTS `cadastro_empresas`;
CREATE TABLE IF NOT EXISTS `cadastro_empresas` (
  `id_empresa` int(11) NOT NULL AUTO_INCREMENT,
  `nome_empresa` varchar(150) NOT NULL,
  `cnpj` varchar(14) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `setor_atuacao` varchar(100) DEFAULT NULL,
  `endereco` varchar(150) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `uf` varchar(2) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.cadastro_empresas: ~0 rows (aproximadamente)
DELETE FROM `cadastro_empresas`;

-- Copiando estrutura para tabela siep.cadastro_usuario
DROP TABLE IF EXISTS `cadastro_usuario`;
CREATE TABLE IF NOT EXISTS `cadastro_usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nome_completo` varchar(150) NOT NULL,
  `data_nasc` date NOT NULL,
  `cpf` varchar(11) NOT NULL,
  `rg` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` varchar(150) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `uf` varchar(2) DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.cadastro_usuario: ~0 rows (aproximadamente)
DELETE FROM `cadastro_usuario`;

-- Copiando estrutura para tabela siep.entrevistas
DROP TABLE IF EXISTS `entrevistas`;
CREATE TABLE IF NOT EXISTS `entrevistas` (
  `id_entrevista` int(11) NOT NULL AUTO_INCREMENT,
  `id_candidatura` int(11) NOT NULL,
  `data` date NOT NULL,
  `horario` time NOT NULL,
  `tipo_entrevista` varchar(50) DEFAULT NULL,
  `local_link` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_entrevista`),
  KEY `id_candidatura` (`id_candidatura`),
  CONSTRAINT `entrevistas_ibfk_1` FOREIGN KEY (`id_candidatura`) REFERENCES `vagas_candidatar` (`id_candidatura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.entrevistas: ~0 rows (aproximadamente)
DELETE FROM `entrevistas`;

-- Copiando estrutura para tabela siep.notificacoes
DROP TABLE IF EXISTS `notificacoes`;
CREATE TABLE IF NOT EXISTS `notificacoes` (
  `id_notificacao` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `id_empresa` int(11) DEFAULT NULL,
  `id_candidatura` int(11) DEFAULT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) DEFAULT 0,
  `data_envio` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_notificacao`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_empresa` (`id_empresa`),
  KEY `id_candidatura` (`id_candidatura`),
  CONSTRAINT `notificacoes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `cadastro_usuario` (`id_usuario`),
  CONSTRAINT `notificacoes_ibfk_2` FOREIGN KEY (`id_empresa`) REFERENCES `cadastro_empresas` (`id_empresa`),
  CONSTRAINT `notificacoes_ibfk_3` FOREIGN KEY (`id_candidatura`) REFERENCES `vagas_candidatar` (`id_candidatura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.notificacoes: ~0 rows (aproximadamente)
DELETE FROM `notificacoes`;

-- Copiando estrutura para tabela siep.perfil_usuario
DROP TABLE IF EXISTS `perfil_usuario`;
CREATE TABLE IF NOT EXISTS `perfil_usuario` (
  `id_perfil` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `sobre_voce` text DEFAULT NULL,
  `escolaridade` varchar(100) DEFAULT NULL,
  `instituicao` varchar(150) DEFAULT NULL,
  `curso` varchar(150) DEFAULT NULL,
  `habilidades` text DEFAULT NULL,
  `arquivo_pdf` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_perfil`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `perfil_usuario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `cadastro_usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.perfil_usuario: ~0 rows (aproximadamente)
DELETE FROM `perfil_usuario`;

-- Copiando estrutura para tabela siep.vagas_candidatar
DROP TABLE IF EXISTS `vagas_candidatar`;
CREATE TABLE IF NOT EXISTS `vagas_candidatar` (
  `id_candidatura` int(11) NOT NULL AUTO_INCREMENT,
  `id_vaga` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `status` enum('analise','aprovado','reprovado') DEFAULT 'analise',
  `data_candidatura` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_candidatura`),
  KEY `id_vaga` (`id_vaga`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `vagas_candidatar_ibfk_1` FOREIGN KEY (`id_vaga`) REFERENCES `vagas_criar` (`id_vaga`),
  CONSTRAINT `vagas_candidatar_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `cadastro_usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.vagas_candidatar: ~0 rows (aproximadamente)
DELETE FROM `vagas_candidatar`;

-- Copiando estrutura para tabela siep.vagas_criar
DROP TABLE IF EXISTS `vagas_criar`;
CREATE TABLE IF NOT EXISTS `vagas_criar` (
  `id_vaga` int(11) NOT NULL AUTO_INCREMENT,
  `id_empresa` int(11) NOT NULL,
  `titulo_vaga` varchar(150) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `modalidade` varchar(50) DEFAULT NULL,
  `area` varchar(100) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `uf` varchar(2) DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT NULL,
  `idade_minima` int(11) DEFAULT NULL,
  `idade_maxima` int(11) DEFAULT NULL,
  `requisitos` text DEFAULT NULL,
  PRIMARY KEY (`id_vaga`),
  KEY `id_empresa` (`id_empresa`),
  CONSTRAINT `vagas_criar_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `cadastro_empresas` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.vagas_criar: ~0 rows (aproximadamente)
DELETE FROM `vagas_criar`;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
