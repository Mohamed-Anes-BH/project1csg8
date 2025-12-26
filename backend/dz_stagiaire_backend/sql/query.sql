-- ==========================================
-- AUTHENTICATION & ACCOUNTS
-- ==========================================

-- name: check_email_exists
SELECT id FROM users WHERE email = %s;

-- name: register_user
INSERT INTO users (email, password_hash, role, verification_token, created_at)
VALUES (%s, %s, %s, %s, NOW());

-- name: get_user_for_login
SELECT id, password_hash, role, is_verified FROM users WHERE email = %s;

-- name: get_user_by_id
SELECT id, email, role, is_verified FROM users WHERE id = %s;

-- name: get_user_by_token
SELECT id FROM users WHERE verification_token = %s;

-- name: verify_user_email
UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = %s;

-- name: get_email_alerts_status
SELECT email_alerts FROM users WHERE id = %s;

-- name: update_email_alerts_status
UPDATE users SET email_alerts = %s WHERE id = %s;


-- ==========================================
-- STUDENT PROFILE & DASHBOARD
-- ==========================================

-- name: create_student_profile
INSERT INTO students (user_id) VALUES (%s);

-- name: get_student_dashboard_stats
SELECT 
    (SELECT COUNT(*) FROM applications WHERE student_id = %s) as applications_count,
    (SELECT COUNT(*) FROM saved_offers WHERE student_id = %s) as saved_offers_count,
    (SELECT views_count FROM students WHERE user_id = %s) as views_count;

-- name: get_student_profile_full
SELECT s.*, u.email 
FROM students s 
JOIN users u ON s.user_id = u.id 
WHERE s.user_id = %s;

-- name: get_student_profile_basic
SELECT * FROM students WHERE user_id = %s;

-- name: increment_student_views
UPDATE students SET views_count = views_count + 1 WHERE user_id = %s;

-- name: get_public_student_profile
SELECT s.*, u.email 
FROM students s 
JOIN users u ON s.user_id = u.id 
WHERE s.user_id = %s AND (s.is_public = TRUE OR s.user_id = %s);

-- name: get_student_visibility
SELECT is_public FROM students WHERE user_id = %s;

-- name: update_student_visibility
UPDATE students SET is_public = %s WHERE user_id = %s;

-- name: update_student_cv
UPDATE students SET cv_path = %s WHERE user_id = %s;

-- name: get_student_skills
SELECT skills FROM students WHERE user_id = %s;


-- ==========================================
-- COMPANY PROFILE & DASHBOARD
-- ==========================================

-- name: create_company_profile
INSERT INTO companies (user_id, name) VALUES (%s, %s);

-- name: get_company_dashboard_stats
SELECT 
    (SELECT COUNT(*) FROM offers WHERE company_id = %s AND deleted_at IS NULL) as offers_count,
    (SELECT COUNT(*) FROM applications a JOIN offers o ON a.offer_id = o.id WHERE o.company_id = %s) as applications_received,
    (SELECT SUM(views) FROM offers WHERE company_id = %s) as global_views;

-- name: get_company_profile_full
SELECT c.*, u.email 
FROM companies c 
JOIN users u ON c.user_id = u.id 
WHERE c.user_id = %s;

-- name: get_company_active_offers
SELECT * FROM offers WHERE company_id = %s AND status = 'OPEN' AND deleted_at IS NULL;


-- ==========================================
-- OFFERS MANAGEMENT
-- ==========================================

-- name: list_offers_base
SELECT o.*, c.name as company_name, c.logo_path 
FROM offers o 
JOIN companies c ON o.company_id = c.user_id 
WHERE o.status = 'OPEN' AND o.deleted_at IS NULL;

-- name: create_offer
INSERT INTO offers (company_id, title, description, type, duration, location, skills, status, created_at)
VALUES (%s, %s, %s, %s, %s, %s, %s, 'OPEN', NOW());

-- name: increment_offer_views
UPDATE offers SET views = views + 1 WHERE id = %s;

-- name: get_offer_detail
SELECT o.*, c.name as company_name, c.description as company_desc, c.website
FROM offers o 
JOIN companies c ON o.company_id = c.user_id 
WHERE o.id = %s AND o.deleted_at IS NULL;

-- name: check_offer_ownership
SELECT id FROM offers WHERE id = %s AND company_id = %s;

-- name: archive_offer
UPDATE offers SET status = 'ARCHIVED' WHERE id = %s;

-- name: delete_offer_logical
UPDATE offers SET deleted_at = NOW() WHERE id = %s;

-- name: save_offer
INSERT IGNORE INTO saved_offers (student_id, offer_id) VALUES (%s, %s);

-- name: unsave_offer
DELETE FROM saved_offers WHERE student_id = %s AND offer_id = %s;

-- name: list_saved_offers
SELECT o.*, c.name as company_name 
FROM saved_offers so 
JOIN offers o ON so.offer_id = o.id 
JOIN companies c ON o.company_id = c.user_id 
WHERE so.student_id = %s;

-- name: get_recommendations_base
SELECT o.*, c.name as company_name 
FROM offers o 
JOIN companies c ON o.company_id = c.user_id 
WHERE o.status = 'OPEN' AND o.deleted_at IS NULL;


-- ==========================================
-- APPLICATIONS
-- ==========================================

-- name: list_applications_student
SELECT a.*, o.title as offer_title, c.name as company_name 
FROM applications a 
JOIN offers o ON a.offer_id = o.id 
JOIN companies c ON o.company_id = c.user_id 
WHERE a.student_id = %s
ORDER BY a.created_at DESC;

-- name: list_applications_company
SELECT a.*, o.title as offer_title, s.first_name, s.last_name, s.cv_path 
FROM applications a 
JOIN offers o ON a.offer_id = o.id 
JOIN students s ON a.student_id = s.user_id 
WHERE o.company_id = %s
ORDER BY a.created_at DESC;

-- name: check_already_applied
SELECT id FROM applications WHERE offer_id = %s AND student_id = %s;

-- name: create_application
INSERT INTO applications (offer_id, student_id, status, created_at) VALUES (%s, %s, 'PENDING', NOW());

-- name: get_company_id_by_offer
SELECT company_id FROM offers WHERE id = %s;

-- name: check_application_ownership
SELECT id FROM applications WHERE id = %s AND student_id = %s;

-- name: delete_application
DELETE FROM applications WHERE id = %s;

-- name: get_application_for_update
SELECT a.id, a.student_id 
FROM applications a 
JOIN offers o ON a.offer_id = o.id 
WHERE a.id = %s AND o.company_id = %s;


-- ==========================================
-- MESSAGING
-- ==========================================

-- name: list_conversations_student
SELECT c.id, com.name as other_party_name, com.logo_path as other_party_image,
(SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != %s AND is_read = FALSE) as unread_count
FROM conversations c 
JOIN companies com ON c.company_id = com.user_id 
WHERE c.student_id = %s;

-- name: list_conversations_company
SELECT c.id, CONCAT(s.first_name, ' ', s.last_name) as other_party_name, NULL as other_party_image,
(SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != %s AND is_read = FALSE) as unread_count
FROM conversations c 
JOIN students s ON c.student_id = s.user_id 
WHERE c.company_id = %s;

-- name: check_conversation_access
SELECT id FROM conversations WHERE id = %s AND (student_id = %s OR company_id = %s);

-- name: mark_messages_read
UPDATE messages SET is_read = TRUE WHERE conversation_id = %s AND sender_id != %s;

-- name: list_messages
SELECT m.*, u.role as sender_role 
FROM messages m 
JOIN users u ON m.sender_id = u.id 
WHERE m.conversation_id = %s 
ORDER BY m.created_at ASC;

-- name: find_conversation
SELECT id FROM conversations WHERE student_id = %s AND company_id = %s;

-- name: create_conversation
INSERT INTO conversations (student_id, company_id, created_at) VALUES (%s, %s, NOW());

-- name: create_message
INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES (%s, %s, %s, NOW());

-- name: get_unread_messages_count
SELECT COUNT(*) as count 
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE (c.student_id = %s OR c.company_id = %s)
AND m.sender_id != %s AND m.is_read = FALSE;


-- ==========================================
-- NOTIFICATIONS
-- ==========================================

-- name: create_notification
INSERT INTO notifications (user_id, title, message, created_at)
VALUES (%s, %s, %s, NOW());

-- name: get_user_email_and_alerts
SELECT email, email_alerts FROM users WHERE id = %s;

-- name: list_notifications
SELECT * FROM notifications WHERE user_id = %s ORDER BY created_at DESC;

-- name: mark_notification_read
UPDATE notifications SET is_read = TRUE WHERE id = %s AND user_id = %s;

-- name: mark_all_notifications_read
UPDATE notifications SET is_read = TRUE WHERE user_id = %s;

-- name: get_unread_notifications_count
SELECT COUNT(*) as count FROM notifications WHERE user_id = %s AND is_read = FALSE;


-- ==========================================
-- BUSINESS LOGS
-- ==========================================

-- name: log_business_action
INSERT INTO business_logs (user_id, action, details, created_at)
VALUES (%s, %s, %s, NOW());

-- name: get_business_logs
SELECT * FROM business_logs ORDER BY created_at DESC LIMIT %s;


-- ==========================================
-- ADMIN PANEL
-- ==========================================

-- name: admin_get_stats
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM offers WHERE deleted_at IS NULL) as total_offers,
    (SELECT COUNT(*) FROM applications) as total_applications;

-- name: admin_list_users
SELECT id, email, role, is_verified, created_at FROM users;

-- name: admin_get_user_status
SELECT is_verified FROM users WHERE id = %s;

-- name: admin_update_user_status
UPDATE users SET is_verified = %s WHERE id = %s;

-- name: admin_list_offers
SELECT o.*, c.name as company_name 
FROM offers o 
JOIN companies c ON o.company_id = c.user_id 
WHERE o.deleted_at IS NULL;


-- ==========================================
-- SYSTEM TASKS
-- ==========================================

-- name: system_expire_offers
UPDATE offers SET status = 'EXPIRED' WHERE expires_at < %s AND status = 'OPEN';


-- ==========================================
-- PASSWORD RESET
-- ==========================================

-- name: set_password_reset_token
UPDATE users SET password_reset_token = %s, password_reset_expires = %s WHERE email = %s;

-- name: get_user_by_reset_token
SELECT id, email FROM users WHERE password_reset_token = %s AND password_reset_expires > NOW();

-- name: reset_password
UPDATE users SET password_hash = %s, password_reset_token = NULL, password_reset_expires = NULL WHERE id = %s;

-- name: resend_verification_token
UPDATE users SET verification_token = %s WHERE email = %s AND is_verified = FALSE;

-- name: get_unverified_user_by_email
SELECT id, verification_token FROM users WHERE email = %s AND is_verified = FALSE;


-- ==========================================
-- ENHANCED STUDENT QUERIES
-- ==========================================

-- name: update_student_profile
UPDATE students SET first_name = %s, last_name = %s, title = %s, bio = %s, skills = %s, 
formations = %s, experiences = %s, linkedin_url = %s, github_url = %s WHERE user_id = %s;

-- name: get_recent_student_notifications
SELECT * FROM notifications WHERE user_id = %s ORDER BY created_at DESC LIMIT %s;


-- ==========================================
-- ENHANCED COMPANY QUERIES  
-- ==========================================

-- name: upload_company_logo
UPDATE companies SET logo_path = %s WHERE user_id = %s;

-- name: get_company_offers_with_stats
SELECT o.*, 
    (SELECT COUNT(*) FROM applications WHERE offer_id = o.id) as applications_count
FROM offers o 
WHERE o.company_id = %s AND o.deleted_at IS NULL
ORDER BY o.created_at DESC;

-- name: filter_applications_by_status
SELECT a.*, o.title as offer_title, s.first_name, s.last_name, s.cv_path, u.email as student_email
FROM applications a 
JOIN offers o ON a.offer_id = o.id 
JOIN students s ON a.student_id = s.user_id 
JOIN users u ON s.user_id = u.id
WHERE o.company_id = %s AND a.status = %s
ORDER BY a.created_at DESC;

-- name: filter_applications_by_offer
SELECT a.*, o.title as offer_title, s.first_name, s.last_name, s.cv_path, u.email as student_email
FROM applications a 
JOIN offers o ON a.offer_id = o.id 
JOIN students s ON a.student_id = s.user_id
JOIN users u ON s.user_id = u.id
WHERE o.id = %s AND o.company_id = %s
ORDER BY a.created_at DESC;

-- name: get_student_cv_for_download
SELECT s.cv_path, s.first_name, s.last_name, u.email 
FROM students s 
JOIN users u ON s.user_id = u.id
WHERE s.user_id = %s;


-- ==========================================
-- ENHANCED OFFER QUERIES
-- ==========================================

-- name: create_offer_draft
INSERT INTO offers (company_id, title, description, type, duration, location, skills, status, created_at)
VALUES (%s, %s, %s, %s, %s, %s, %s, 'DRAFT', NOW());

-- name: publish_offer
UPDATE offers SET status = 'OPEN' WHERE id = %s AND company_id = %s AND status = 'DRAFT';

-- name: get_company_drafts
SELECT * FROM offers WHERE company_id = %s AND status = 'DRAFT' AND deleted_at IS NULL;

-- name: get_company_published
SELECT * FROM offers WHERE company_id = %s AND status = 'OPEN' AND deleted_at IS NULL;

-- name: search_offers_advanced
SELECT o.*, c.name as company_name, c.logo_path, c.location as company_location
FROM offers o 
JOIN companies c ON o.company_id = c.user_id 
WHERE o.status = 'OPEN' AND o.deleted_at IS NULL;


-- ==========================================
-- DASHBOARD ENHANCEMENTS
-- ==========================================

-- name: get_student_dashboard_full
SELECT 
    (SELECT COUNT(*) FROM applications WHERE student_id = %s) as applications_count,
    (SELECT COUNT(*) FROM saved_offers WHERE student_id = %s) as saved_offers_count,
    (SELECT views_count FROM students WHERE user_id = %s) as views_count,
    (SELECT COUNT(*) FROM notifications WHERE user_id = %s AND is_read = FALSE) as unread_notifications;

-- name: get_company_dashboard_full
SELECT 
    (SELECT COUNT(*) FROM offers WHERE company_id = %s AND deleted_at IS NULL) as total_offers,
    (SELECT COUNT(*) FROM offers WHERE company_id = %s AND status = 'OPEN' AND deleted_at IS NULL) as active_offers,
    (SELECT COUNT(*) FROM offers WHERE company_id = %s AND status = 'DRAFT' AND deleted_at IS NULL) as draft_offers,
    (SELECT COUNT(*) FROM applications a JOIN offers o ON a.offer_id = o.id WHERE o.company_id = %s) as applications_received,
    (SELECT COUNT(*) FROM applications a JOIN offers o ON a.offer_id = o.id WHERE o.company_id = %s AND a.status = 'PENDING') as pending_applications,
    (SELECT SUM(views) FROM offers WHERE company_id = %s) as total_views,
    (SELECT COUNT(*) FROM notifications WHERE user_id = %s AND is_read = FALSE) as unread_notifications;


-- ==========================================
-- PROFILE COMPLETENESS CHECK
-- ==========================================

-- name: check_student_profile_complete
SELECT 
    CASE WHEN first_name IS NOT NULL AND first_name != '' THEN 1 ELSE 0 END +
    CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 1 ELSE 0 END +
    CASE WHEN title IS NOT NULL AND title != '' THEN 1 ELSE 0 END +
    CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END +
    CASE WHEN skills IS NOT NULL AND skills != '' THEN 1 ELSE 0 END +
    CASE WHEN formations IS NOT NULL AND formations != '' THEN 1 ELSE 0 END +
    CASE WHEN experiences IS NOT NULL AND experiences != '' THEN 1 ELSE 0 END +
    CASE WHEN cv_path IS NOT NULL AND cv_path != '' THEN 1 ELSE 0 END +
    CASE WHEN linkedin_url IS NOT NULL AND linkedin_url != '' THEN 1 ELSE 0 END +
    CASE WHEN github_url IS NOT NULL AND github_url != '' THEN 1 ELSE 0 END as filled_fields
FROM students WHERE user_id = %s;

-- name: check_company_profile_complete
SELECT 
    CASE WHEN name IS NOT NULL AND name != '' THEN 1 ELSE 0 END +
    CASE WHEN description IS NOT NULL AND description != '' THEN 1 ELSE 0 END +
    CASE WHEN industry IS NOT NULL AND industry != '' THEN 1 ELSE 0 END +
    CASE WHEN location IS NOT NULL AND location != '' THEN 1 ELSE 0 END +
    CASE WHEN website IS NOT NULL AND website != '' THEN 1 ELSE 0 END +
    CASE WHEN logo_path IS NOT NULL AND logo_path != '' THEN 1 ELSE 0 END +
    CASE WHEN size IS NOT NULL AND size != '' THEN 1 ELSE 0 END as filled_fields
FROM companies WHERE user_id = %s;


-- ==========================================
-- INCOMPLETE PROFILE USERS (FOR REMINDERS)
-- ==========================================

-- name: get_incomplete_student_profiles
SELECT u.id, u.email, s.first_name
FROM users u
JOIN students s ON u.id = s.user_id
WHERE u.is_verified = TRUE 
AND (s.first_name IS NULL OR s.bio IS NULL OR s.skills IS NULL OR s.cv_path IS NULL);

-- name: get_incomplete_company_profiles
SELECT u.id, u.email, c.name
FROM users u
JOIN companies c ON u.id = c.user_id
WHERE u.is_verified = TRUE 
AND (c.description IS NULL OR c.industry IS NULL OR c.logo_path IS NULL);
