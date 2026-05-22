-- =============================================================================
-- Migration 003: Functions & Triggers — T&J CRM
-- =============================================================================
-- Depends on: 20260521000001_initial_schema.sql
--
-- Triggers:
--   1. updated_at         — keeps updated_at current on every UPDATE
--   2. pitch_answered     — auto-creates Lead + Notification when pitch → 'answered'
--   3. appt_rescheduled   — reverts Lead status + saves previous date on rescheduling
--
-- Utility:
--   public.generate_due_notifications() — called by Supabase Cron (daily)
-- =============================================================================

-- =============================================================================
-- TRIGGER 1: updated_at
-- One shared function, one trigger per table.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to every table that has updated_at

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_pitch_templates_updated_at
  BEFORE UPDATE ON pitch_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_pitches_updated_at
  BEFORE UPDATE ON pitches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_followups_updated_at
  BEFORE UPDATE ON followups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_meeting_outcomes_updated_at
  BEFORE UPDATE ON meeting_outcomes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- TRIGGER 2: Auto-create Lead when pitch.status transitions to 'answered'
--
-- Guards:
--   - Only fires on actual 'answered' transition (not on repeated updates)
--   - EXISTS check prevents duplicate leads for the same pitch
--   - SECURITY DEFINER so the trigger bypasses RLS when inserting system records
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_create_lead_on_pitch_answered()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead_id UUID;
BEGIN
  -- Only act on a real transition to 'answered'
  IF NEW.status = 'answered' AND (OLD.status IS DISTINCT FROM 'answered') THEN

    -- Prevent duplicate leads
    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE pitch_id = NEW.id) THEN

      INSERT INTO public.leads (
        organization_id,
        prospect_id,
        pitch_id,
        assigned_to,
        status
      ) VALUES (
        NEW.organization_id,
        NEW.prospect_id,
        NEW.id,
        NEW.sent_by,
        'new'
      )
      RETURNING id INTO v_lead_id;

      -- Stamp the answer time on the pitch
      NEW.answered_at = NOW();

      -- Notify the sender
      INSERT INTO public.notifications (
        organization_id,
        user_id,
        type,
        reference_table,
        reference_id,
        title,
        body
      ) VALUES (
        NEW.organization_id,
        NEW.sent_by,
        'lead_created',
        'leads',
        v_lead_id,
        'Neue Lead erstellt',
        'Ein Prospect hat geantwortet und wurde automatisch als Lead ins CRM übertragen.'
      );

    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- BEFORE UPDATE so we can modify NEW.answered_at in the same row
CREATE TRIGGER trg_pitch_answered
  BEFORE UPDATE ON pitches
  FOR EACH ROW
  WHEN (NEW.status = 'answered' AND OLD.status IS DISTINCT FROM 'answered')
  EXECUTE FUNCTION public.fn_create_lead_on_pitch_answered();

-- =============================================================================
-- TRIGGER 3: Status rollback when appointment is rescheduled
--
-- When an appointment transitions from 'scheduled' → 'rescheduled':
--   - Saves the original scheduled_at into previous_scheduled_at
--   - Reverts the Lead's status back to 'contacted' if it was already progressed
--     (avoids reverting leads that are still in 'new' or already won/lost)
--   - Notifies the assignee
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_handle_appointment_rescheduled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Save previous time before it's overwritten
  NEW.previous_scheduled_at = OLD.scheduled_at;

  -- Revert lead status to 'contacted' if it had progressed into the meeting funnel
  UPDATE public.leads
  SET
    status     = 'contacted',
    updated_at = NOW()
  WHERE
    id     = NEW.lead_id
    AND status IN ('qualified', 'proposal', 'negotiating');

  -- Notify the assignee (if set)
  IF NEW.assigned_to IS NOT NULL THEN
    INSERT INTO public.notifications (
      organization_id,
      user_id,
      type,
      reference_table,
      reference_id,
      title,
      body
    ) VALUES (
      NEW.organization_id,
      NEW.assigned_to,
      'appointment_rescheduled',
      'appointments',
      NEW.id,
      'Termin verschoben',
      'Ein Termin wurde neu terminiert. Bitte neuen Zeitslot festlegen.'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_appointment_rescheduled
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  WHEN (NEW.status = 'rescheduled' AND OLD.status = 'scheduled')
  EXECUTE FUNCTION public.fn_handle_appointment_rescheduled();

-- =============================================================================
-- UTILITY: generate_due_notifications()
--
-- Meant to be called once daily by a Supabase Cron job (pg_cron) or Edge Function.
-- Creates notifications for:
--   - Follow-ups that are due today and still pending
--   - Appointments within the next 24 hours that are still scheduled
--
-- Idempotent: skips if a notification of the same type+reference already exists today.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.generate_due_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

  -- Followup due today
  INSERT INTO public.notifications (
    organization_id,
    user_id,
    type,
    reference_table,
    reference_id,
    title,
    body
  )
  SELECT
    f.organization_id,
    f.assigned_to,
    'followup_due',
    'followups',
    f.id,
    'Follow-Up fällig (Stufe ' || f.level || ')',
    'Du hast heute ein fälliges Follow-Up.'
  FROM public.followups f
  WHERE
    f.status        = 'pending'
    AND f.scheduled_for = CURRENT_DATE
    AND f.assigned_to IS NOT NULL
    -- Idempotency: skip if already notified today
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.reference_id   = f.id
        AND n.type           = 'followup_due'
        AND n.created_at::date = CURRENT_DATE
    );

  -- Appointment due within 24 hours
  INSERT INTO public.notifications (
    organization_id,
    user_id,
    type,
    reference_table,
    reference_id,
    title,
    body
  )
  SELECT
    a.organization_id,
    a.assigned_to,
    'appointment_due',
    'appointments',
    a.id,
    'Termin in Kürze: ' || a.title,
    'Du hast in den nächsten 24 Stunden einen Termin.'
  FROM public.appointments a
  WHERE
    a.status       = 'scheduled'
    AND a.scheduled_at BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
    AND a.assigned_to IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.reference_id   = a.id
        AND n.type           = 'appointment_due'
        AND n.created_at::date = CURRENT_DATE
    );

END;
$$;

-- =============================================================================
-- Auto-create profile on new user signup (via auth.users insert)
-- Requires the org_id to be passed in user_metadata at signup time:
--   supabase.auth.signUp({ email, password, options: { data: { organization_id, full_name } } })
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, organization_id, role, full_name)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'organization_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_user();
