
-- Delete all client and provider profiles and their associated data
-- This script preserves admin users and platform configuration

BEGIN;

-- Delete associated data first (in dependency order)

-- Delete quiz attempts for providers
DELETE FROM quiz_attempts 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete provider learning progress
DELETE FROM provider_learning_progress 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete provider certificates
DELETE FROM provider_certificates 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete provider documents
DELETE FROM provider_documents 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete provider references
DELETE FROM provider_references 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete provider banking details
DELETE FROM provider_banking_details 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete provider payment methods
DELETE FROM provider_payment_methods 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete provider availability
DELETE FROM provider_availability 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete provider time off
DELETE FROM provider_time_off 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete provider specializations
DELETE FROM provider_specializations 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete provider categories
DELETE FROM provider_categories 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete messages sent or received by these users
DELETE FROM messages 
WHERE sender_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'))
   OR recipient_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete support tickets created by these users
DELETE FROM support_ticket_responses 
WHERE user_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

DELETE FROM support_tickets 
WHERE user_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete notifications for these users
DELETE FROM notifications 
WHERE user_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete notification preferences
DELETE FROM notification_preferences 
WHERE user_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete user behavior events
DELETE FROM user_behavior_events 
WHERE user_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete email verification tokens
DELETE FROM email_verification_tokens 
WHERE user_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete user active packages
DELETE FROM user_active_packages 
WHERE user_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete service usage logs
DELETE FROM service_usage_logs 
WHERE user_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete pending transactions
DELETE FROM pending_transactions 
WHERE user_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete customer analytics
DELETE FROM customer_analytics 
WHERE client_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete payout analytics for providers
DELETE FROM payout_analytics 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete payouts for providers
DELETE FROM payouts 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete booking assignments
DELETE FROM booking_assignments 
WHERE provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete bookings (both as client and provider)
DELETE FROM bookings 
WHERE client_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'))
   OR provider_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete package bookings
DELETE FROM package_bookings 
WHERE client_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Delete FAQ analytics
DELETE FROM faq_analytics 
WHERE user_id IN (SELECT id FROM users WHERE role IN ('client', 'provider'));

-- Finally, delete the user profiles themselves
DELETE FROM users WHERE role IN ('client', 'provider');

COMMIT;
