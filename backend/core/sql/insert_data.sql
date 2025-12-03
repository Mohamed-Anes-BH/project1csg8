-- ============================================
-- DZ-Stagiaire - Sample Data for Core Tables
-- Données d'exemple pour les universités et domaines
-- ============================================

-- Insertion des universités algériennes
INSERT IGNORE INTO universities (name, city) VALUES
('Université des Sciences et de la Technologie Houari Boumediene (USTHB)', 'Alger'),
('École Nationale Supérieure d''Informatique (ESI)', 'Alger'),
('Université d''Alger 1', 'Alger'),
('Université de Constantine 1', 'Constantine'),
('Université de Constantine 2', 'Constantine'),
('Université d''Oran 1', 'Oran'),
('Université de Tlemcen', 'Tlemcen'),
('Université de Béjaïa', 'Béjaïa'),
('Université de Sétif 1', 'Sétif'),
('Université de Annaba', 'Annaba');

-- Insertion des domaines d'études
INSERT IGNORE INTO domains (name) VALUES
('Informatique'),
('Électronique'),
('Télécommunications'),
('Génie Civil'),
('Génie Mécanique'),
('Génie Électrique'),
('Mathématiques'),
('Physique');

-- Insertion des spécialités pour Informatique
INSERT IGNORE INTO specialties (domain_id, name) VALUES
(1, 'Génie Logiciel'),
(1, 'Systèmes d''Information'),
(1, 'Intelligence Artificielle'),
(1, 'Réseaux et Sécurité'),
(1, 'Systèmes Informatiques'),
(1, 'Ingénierie Web et Mobile');

-- Insertion des spécialités pour Électronique
INSERT IGNORE INTO specialties (domain_id, name) VALUES
(2, 'Électronique Embarquée'),
(2, 'Microélectronique'),
(2, 'Systèmes Électroniques'),
(2, 'Automatique et Systèmes');

-- Insertion des spécialités pour Télécommunications
INSERT IGNORE INTO specialties (domain_id, name) VALUES
(3, 'Réseaux et Télécommunications'),
(3, 'Systèmes de Télécommunications'),
(3, 'Communications Sans Fil');

-- Insertion des spécialités pour Génie Civil
INSERT IGNORE INTO specialties (domain_id, name) VALUES
(4, 'Structures'),
(4, 'Géotechnique'),
(4, 'Hydraulique');
