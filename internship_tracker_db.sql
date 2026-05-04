-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 04 mai 2026 à 22:17
-- Version du serveur : 8.4.7
-- Version de PHP : 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `internship_tracker_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `cache`
--

DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `commentaires`
--

DROP TABLE IF EXISTS `commentaires`;
CREATE TABLE IF NOT EXISTS `commentaires` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contenu` varchar(255) DEFAULT NULL,
  `date_creation` datetime(6) DEFAULT NULL,
  `auteur_id` bigint DEFAULT NULL,
  `rapport_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9ln3ltemfs8wge22nx61vns9t` (`auteur_id`),
  KEY `FKrnmdn2emgdpggcfcybvpl49wg` (`rapport_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `deadlines`
--

DROP TABLE IF EXISTS `deadlines`;
CREATE TABLE IF NOT EXISTS `deadlines` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date_limite` date DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `deadlines`
--

INSERT INTO `deadlines` (`id`, `date_limite`, `type`) VALUES
(1, '2026-05-02', 'rapport cette semaine');

-- --------------------------------------------------------

--
-- Structure de la table `demandes_encadrement`
--

DROP TABLE IF EXISTS `demandes_encadrement`;
CREATE TABLE IF NOT EXISTS `demandes_encadrement` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date_demande` datetime(6) DEFAULT NULL,
  `date_reponse` datetime(6) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `statut` enum('ACCEPTE','EN_ATTENTE','REFUSE') DEFAULT NULL,
  `encadrant_id` bigint DEFAULT NULL,
  `etudiant_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcfhby01mwy6goygmhnnvwe5w` (`encadrant_id`),
  KEY `FKbo5kcrk4yudthps40upk7929k` (`etudiant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `demandes_encadrement`
--

INSERT INTO `demandes_encadrement` (`id`, `date_demande`, `date_reponse`, `message`, `statut`, `encadrant_id`, `etudiant_id`) VALUES
(3, '2026-04-27 23:35:43.359648', '2026-04-27 23:38:32.780414', 'Bonjour, je souhaite être encadré par vous pour mon stage.', 'ACCEPTE', 3, 1),
(4, '2026-04-29 19:04:46.806445', '2026-04-30 00:25:40.179580', 'bonjour monsieur ..........', 'REFUSE', 3, 1);

-- --------------------------------------------------------

--
-- Structure de la table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000001_create_cache_table', 1),
(2, '0001_01_01_000002_create_jobs_table', 1),
(3, '2026_05_04_153840_add_role_to_users_table', 1);

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date_envoi` datetime(6) DEFAULT NULL,
  `est_lue` bit(1) NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `deadline_id` bigint DEFAULT NULL,
  `rapport_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKpysrkkgc4tktp2ar7g4cmpk2x` (`deadline_id`),
  KEY `FKljibtv9iqbctg9m4eps4dravn` (`rapport_id`),
  KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id`, `date_envoi`, `est_lue`, `message`, `titre`, `deadline_id`, `rapport_id`, `user_id`) VALUES
(1, '2026-04-27 23:31:40.725763', b'0', 'Test Etudiant vous a envoyé une demande d\'encadrement', 'Nouvelle demande d\'encadrement', NULL, NULL, 2),
(2, '2026-04-27 23:34:57.929848', b'0', 'Test Etudiant vous a envoyé une demande d\'encadrement', 'Nouvelle demande d\'encadrement', NULL, NULL, 2),
(3, '2026-04-27 23:35:43.363647', b'0', 'Test Etudiant vous a envoyé une demande d\'encadrement', 'Nouvelle demande d\'encadrement', NULL, NULL, 3),
(4, '2026-04-27 23:38:32.797959', b'0', 'Dr. Thorne a accepté votre demande d\'encadrement', 'Demande acceptée ✅', NULL, NULL, 1),
(5, '2026-04-29 19:04:46.964049', b'0', 'Test Etudiant vous a envoyé une demande d\'encadrement', 'Nouvelle demande d\'encadrement', NULL, NULL, 3),
(6, '2026-04-30 00:25:40.303588', b'0', 'Dr. Thorne a refusé votre demande d\'encadrement', 'Demande refusée ❌', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Structure de la table `rapports`
--

DROP TABLE IF EXISTS `rapports`;
CREATE TABLE IF NOT EXISTS `rapports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contenu` varchar(255) DEFAULT NULL,
  `date_depot` datetime(6) DEFAULT NULL,
  `statut` varchar(255) DEFAULT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `auteur_id` bigint DEFAULT NULL,
  `encadrant_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKs4lpq2u42dqj59pm32okgn1tl` (`auteur_id`),
  KEY `FK3i1magfs9vnqdhxkw2k6q3chv` (`encadrant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `rapports`
--

INSERT INTO `rapports` (`id`, `contenu`, `date_depot`, `statut`, `titre`, `auteur_id`, `encadrant_id`) VALUES
(1, 'Contenu du rapport de stage', '2026-04-26 18:54:58.618884', 'SOUMIS', 'Mon premier rapport', 1, 1);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `mot_de_passe` varchar(255) DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','ENCADRANT','ETUDIANT') DEFAULT NULL,
  `encadrant_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdud2hnw7j29v4c0ai25cr2pim` (`encadrant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `mot_de_passe`, `nom`, `role`, `encadrant_id`) VALUES
(1, 'etudiant@test.com', '$2a$10$Pe9tcygt1uCR2iXiqohYPOeQrwdanIGSjKX./ybALjqQm9KzIt1Nu', 'Test Etudiant', 'ETUDIANT', 3),
(2, 'admin@test.com', '$2a$10$.8WwCBUE/.oAu/scI5pGOu.IeXa.M5Kdoe7M4BO1Cfy7jgOhAivbS', 'Admin Principal', 'ADMIN', NULL),
(3, 'encadrant@test.com', '$2a$10$9DAwHTNGiLrt5g.YIDLGC.xhJQRpp1KGoWb.nQrepCf9qooj8863S', 'Dr. Thorne', 'ENCADRANT', NULL),
(6, 'etu@gmail.com', '$2a$10$HWFpYOQ4L9XVTRJz/VBkMevoiviLU9ImUYMyGfVG/ONa1hQ7j390K', 'etud', 'ETUDIANT', NULL),
(7, 'test@gmail.com', '$2y$12$6nm4nyjQxRCch.A6zCVtJejVXJdRJ6k0RsXaTDITc7PtxlK9Ns9h6', 'test user', 'ADMIN', NULL),
(8, 'ala@gmail.com', '$2y$12$kuGYs.7QDKV8Pwoz5/NsKuk9ET5oEQioNiUWY5B3KV/g8V8aCLiTm', 'ala', 'ETUDIANT', NULL),
(9, 'test@example.com', '$2y$12$otQX/POQBm7c2OmTPcmANedcaOKuNucJJKcyJyq5y5I1tcG0EYrRa', 'Test User', 'ETUDIANT', NULL),
(10, 'newtest@example.com', '$2y$12$UfY4kjUgBazyLPJUlRkIweLvH7o5.WA16AnYs8Z/AM58Tk0jAxMpq', 'NewTest', 'ETUDIANT', NULL),
(11, 'anothertest@example.com', '$2y$12$.d2MRUHtAPMF8veGjqf4Nur6V7N4gwt1z2wQHMALBcYP94MHHKcpm', 'AnotherTest', 'ETUDIANT', NULL),
(12, 'finaltest@example.com', '$2y$12$IQq.zcT4LF.NqOZ7U1RA6O29N3OLT5IhDjY.Mk4V3oIvYk7CHX8y.', 'FinalTest', 'ETUDIANT', NULL),
(13, 'ala1@gmail.com', '$2y$12$GYMpuwREf1LBAi2AoyDzQeBfHEAQSnh.0YvF4RbzVo0ELJqRMfwsW', 'ala', 'ETUDIANT', NULL),
(14, 'test1@gmail.com', '$2y$12$/2CppOum8a2Wrmj1cgvKpeViwrm8ozwrlUYT7y6Tw/GGTdhciMe16', 'test', 'ENCADRANT', NULL),
(15, 'fedi@gmail.com', '$2y$12$n4Ypq3zecNUaOX1qYfbW2uCPkXW0SxC2hzenWnUhHfiLJJ78ulRli', 'fedi', 'ADMIN', NULL);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `commentaires`
--
ALTER TABLE `commentaires`
  ADD CONSTRAINT `FK9ln3ltemfs8wge22nx61vns9t` FOREIGN KEY (`auteur_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKrnmdn2emgdpggcfcybvpl49wg` FOREIGN KEY (`rapport_id`) REFERENCES `rapports` (`id`);

--
-- Contraintes pour la table `demandes_encadrement`
--
ALTER TABLE `demandes_encadrement`
  ADD CONSTRAINT `FKbo5kcrk4yudthps40upk7929k` FOREIGN KEY (`etudiant_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKcfhby01mwy6goygmhnnvwe5w` FOREIGN KEY (`encadrant_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKljibtv9iqbctg9m4eps4dravn` FOREIGN KEY (`rapport_id`) REFERENCES `rapports` (`id`),
  ADD CONSTRAINT `FKpysrkkgc4tktp2ar7g4cmpk2x` FOREIGN KEY (`deadline_id`) REFERENCES `deadlines` (`id`);

--
-- Contraintes pour la table `rapports`
--
ALTER TABLE `rapports`
  ADD CONSTRAINT `FK3i1magfs9vnqdhxkw2k6q3chv` FOREIGN KEY (`encadrant_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKs4lpq2u42dqj59pm32okgn1tl` FOREIGN KEY (`auteur_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `FKdud2hnw7j29v4c0ai25cr2pim` FOREIGN KEY (`encadrant_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
