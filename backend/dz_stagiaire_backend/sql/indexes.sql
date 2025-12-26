-- Index supplémentaires pour optimisation des performances
-- DZ-Stagiaire Backend
-- Ces index sont OPTIONNELS mais recommandés pour améliorer les performances

-- Index pour la table offers
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_company ON offers(company_id);
CREATE INDEX idx_offers_type ON offers(type);
CREATE INDEX idx_offers_created ON offers(created_at DESC);

-- Index pour la table applications
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_offer ON applications(offer_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created ON applications(created_at DESC);

-- Index pour la table notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Index pour la table messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Index pour la table business_logs
CREATE INDEX idx_logs_user ON business_logs(user_id);
CREATE INDEX idx_logs_action ON business_logs(action);
CREATE INDEX idx_logs_created ON business_logs(created_at DESC);

-- Index pour recherche full-text (optionnel)
-- ALTER TABLE offers ADD FULLTEXT INDEX ft_offers_search (title, description, skills);
-- ALTER TABLE students ADD FULLTEXT INDEX ft_students_search (first_name, last_name, bio, skills);
-- ALTER TABLE companies ADD FULLTEXT INDEX ft_companies_search (name, description);
