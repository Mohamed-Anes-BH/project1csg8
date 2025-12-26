-- ============================================
-- DZ-Stagiaire - Notifications Table (MySQL)
-- Table: notifications
-- ============================================

-- Table: notifications (Notifications utilisateur)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('APPLICATION_STATUS', 'NEW_OFFER', 'SYSTEM') DEFAULT 'APPLICATION_STATUS',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour améliorer les performances
CREATE INDEX idx_notification_user ON notifications(user_id);
CREATE INDEX idx_notification_read ON notifications(is_read);
