-- ============================================
-- DZ-Stagiaire - Offers Tables (MySQL)
-- Tables: offers, applications, offer_specialties, offer_universities
-- ============================================

-- Table: offers (Offres de stage/PFE/emploi)
CREATE TABLE IF NOT EXISTS offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    offer_type ENUM('STAGE', 'PFE', 'PREMIER_EMPLOI') NOT NULL,
    duration VARCHAR(50),
    location VARCHAR(100),
    is_targeted BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: offer_specialties (Spécialités recherchées - Many-to-Many)
CREATE TABLE IF NOT EXISTS offer_specialties (
    offer_id INT NOT NULL,
    specialty_id INT NOT NULL,
    PRIMARY KEY (offer_id, specialty_id),
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: offer_universities (Ciblage par université - Many-to-Many)
CREATE TABLE IF NOT EXISTS offer_universities (
    offer_id INT NOT NULL,
    university_id INT NOT NULL,
    PRIMARY KEY (offer_id, university_id),
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: applications (Candidatures avec cycle de vie)
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    offer_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('REÇUE', 'EN_COURS', 'ENTRETIEN', 'ACCEPTÉE', 'REFUSÉE') DEFAULT 'REÇUE',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (offer_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour améliorer les performances
-- CREATE INDEX IF NOT EXISTS idx_offer_company ON offers(company_id);
-- CREATE INDEX idx_offer_type ON offers(offer_type);
-- CREATE INDEX idx_offer_active ON offers(is_active);
-- CREATE INDEX IF NOT EXISTS idx_application_offer ON applications(offer_id);
-- CREATE INDEX IF NOT EXISTS idx_application_student ON applications(student_id);
-- CREATE INDEX idx_application_status ON applications(status);
