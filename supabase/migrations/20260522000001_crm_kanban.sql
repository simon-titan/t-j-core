-- CRM Kanban Board: additional fields for prospects, leads, appointments

-- prospects: missing contact fields
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS website      text,
  ADD COLUMN IF NOT EXISTS industry     text,
  ADD COLUMN IF NOT EXISTS company_size text;

-- leads: qualification notes + meeting system type
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS pain_points    text,
  ADD COLUMN IF NOT EXISTS objections     text,
  ADD COLUMN IF NOT EXISTS meeting_system text CHECK (meeting_system IN ('direct', 'two_meeting'));

-- appointments: meeting type badge
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS meeting_type text CHECK (meeting_type IN ('discovery', 'demo', 'proposal', 'closing', 'follow_up', 'other'));
