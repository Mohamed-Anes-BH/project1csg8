-- Admin Panel Additional Schema for DZ-Stagiaire
-- MySQL 8.0+

-- Activity Logs (for admin dashboard recent activity)
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('NEW_USER', 'NEW_OFFER', 'NEW_APPLICATION', 'COMPANY_VERIFIED', 'OFFER_REPORTED', 'USER_SUSPENDED') NOT NULL,
    user_id INT,
    target_id INT,
    target_type VARCHAR(50),
    description TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports (for reported offers/users)
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    target_id INT NOT NULL,
    target_type ENUM('OFFER', 'USER', 'MESSAGE') NOT NULL,
    reason ENUM('SPAM', 'INAPPROPRIATE', 'SCAM', 'DUPLICATE', 'OTHER') NOT NULL,
    description TEXT,
    status ENUM('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED') DEFAULT 'PENDING',
    admin_note TEXT,
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Settings (system parameters)
CREATE TABLE IF NOT EXISTS admin_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
    category ENUM('GENERAL', 'EMAIL', 'SECURITY', 'NOTIFICATIONS', 'MAINTENANCE') DEFAULT 'GENERAL',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Monthly Stats (for growth chart)
CREATE TABLE IF NOT EXISTS monthly_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    month INT NOT NULL,
    total_users INT DEFAULT 0,
    total_students INT DEFAULT 0,
    total_companies INT DEFAULT 0,
    total_offers INT DEFAULT 0,
    total_applications INT DEFAULT 0,
    new_users INT DEFAULT 0,
    new_offers INT DEFAULT 0,
    new_applications INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_month (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, setting_type, category, description) VALUES
('site_name', 'DZ-Stagiaire', 'STRING', 'GENERAL', 'Nom du site'),
('site_description', 'Plateforme de stages et PFE en Algérie', 'STRING', 'GENERAL', 'Description du site'),
('maintenance_mode', 'false', 'BOOLEAN', 'MAINTENANCE', 'Mode maintenance activé'),
('maintenance_message', 'Le site est en maintenance. Veuillez réessayer plus tard.', 'STRING', 'MAINTENANCE', 'Message de maintenance'),
('max_applications_per_student', '10', 'NUMBER', 'GENERAL', 'Nombre max de candidatures par étudiant'),
('email_verification_required', 'true', 'BOOLEAN', 'SECURITY', 'Vérification email obligatoire'),
('auto_approve_offers', 'false', 'BOOLEAN', 'GENERAL', 'Approbation automatique des offres'),
('offer_expiry_days', '30', 'NUMBER', 'GENERAL', 'Durée de validité des offres (jours)'),
('smtp_enabled', 'true', 'BOOLEAN', 'EMAIL', 'Envoi d\'emails activé'),
('new_user_notification', 'true', 'BOOLEAN', 'NOTIFICATIONS', 'Notification admin nouveau utilisateur'),
('new_offer_notification', 'true', 'BOOLEAN', 'NOTIFICATIONS', 'Notification admin nouvelle offre'),
('daily_report_enabled', 'false', 'BOOLEAN', 'NOTIFICATIONS', 'Rapport quotidien par email')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Add is_approved column to offers if not exists
ALTER TABLE offers ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE offers ADD COLUMN approved_by INT;
ALTER TABLE offers ADD COLUMN approved_at TIMESTAMP NULL;

-- Create indexes for better performance
CREATE INDEX idx_activity_logs_type ON activity_logs(type);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
