-- ============================================
-- DZ-Stagiaire - Offer Views Table (MySQL)
-- Table: offer_views (Statistiques de vues)
-- ============================================

-- Table: offer_views (Tracking des vues d'offres)
CREATE TABLE IF NOT EXISTS offer_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    offer_id INT NOT NULL,
    student_id INT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour améliorer les performances
CREATE INDEX idx_view_offer ON offer_views(offer_id);
CREATE INDEX idx_view_student ON offer_views(student_id);
