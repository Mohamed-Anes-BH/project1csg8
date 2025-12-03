-- ============================================
-- DZ-Stagiaire - Accounts Tables (MySQL)
-- Tables: users, student_profiles, company_profiles
-- ============================================

-- Table: users (Utilisateurs - Étudiants et Entreprises)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('STUDENT', 'COMPANY') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: student_profiles (Profils étudiants avec CV)
CREATE TABLE IF NOT EXISTS student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    university_id INT,
    domain_id INT,
    specialty_id INT,
    skills TEXT,
    experience TEXT,
    education TEXT,
    portfolio_link VARCHAR(255),
    github_link VARCHAR(255),
    cv_visibility ENUM('PUBLIC', 'PRIVATE') DEFAULT 'PRIVATE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE SET NULL,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE SET NULL,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: company_profiles (Profils entreprises)
CREATE TABLE IF NOT EXISTS company_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    description TEXT,
    sector VARCHAR(100),
    website VARCHAR(255),
    logo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour améliorer les performances
-- Note: CREATE INDEX IF NOT EXISTS est supporté par MySQL 8.0+
-- Les index sur les FK sont souvent automatiques, mais on peut les expliciter si besoin
-- CREATE INDEX IF NOT EXISTS idx_student_university ON student_profiles(university_id);
-- CREATE INDEX IF NOT EXISTS idx_student_specialty ON student_profiles(specialty_id);
-- CREATE INDEX idx_user_type ON users(user_type);
-- CREATE INDEX idx_user_email ON users(email);
