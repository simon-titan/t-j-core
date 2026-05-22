-- =============================================================================
-- Migration: Performance Indexes — T&J CRM
-- =============================================================================

-- Pitches: häufige Filter nach User, Org+Datum, Status
CREATE INDEX IF NOT EXISTS idx_pitches_sent_by     ON pitches(sent_by);
CREATE INDEX IF NOT EXISTS idx_pitches_org_sent_at ON pitches(organization_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_pitches_status      ON pitches(status);

-- Leads: Filter nach Org+Status (Kanban-Board) und Zuständigkeit
CREATE INDEX IF NOT EXISTS idx_leads_org_status  ON leads(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);

-- Appointments: Join über lead_id, Sortierung nach scheduled_at
CREATE INDEX IF NOT EXISTS idx_appointments_lead_id      ON appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);

-- Followups: Partial index für pending (NotificationBell + FollowUpList)
CREATE INDEX IF NOT EXISTS idx_followups_assigned_pending ON followups(assigned_to, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_followups_scheduled_for   ON followups(scheduled_for);

-- Notifications: Partial index für ungelesene (NotificationBell)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Onboarding: Antworten pro User
CREATE INDEX IF NOT EXISTS idx_onboarding_answers_user ON onboarding_answers(user_id);

-- Prospects: Org-Filter, LinkedIn-URL Suche
CREATE INDEX IF NOT EXISTS idx_prospects_org      ON prospects(organization_id);
CREATE INDEX IF NOT EXISTS idx_prospects_linkedin ON prospects(linkedin_url);
