-- =============================================================================
-- Migration 002 (2026-05-22): Notification System — T&J CRM
-- =============================================================================
-- Changes:
--   1. Extend notifications.type CHECK to include 'reschedule_needed'
--   2. Replace generate_due_notifications() with updated version that also
--      generates daily reminders for leads stuck in "Neu Terminieren"
--   3. Schedule generate_due_notifications() via pg_cron (07:00 UTC daily)
--      Requires pg_cron extension enabled in Supabase project settings.
-- =============================================================================

-- =============================================================================
-- 1. Extend type constraint
-- =============================================================================

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'followup_due',
    'appointment_due',
    'appointment_rescheduled',
    'lead_created',
    'deal_updated',
    'reschedule_needed'
  ));

-- =============================================================================
-- 2. Replace generate_due_notifications()
--    Now handles three scenarios:
--      a) Follow-ups due today (status = 'pending', scheduled_for = today)
--      b) Appointments within the next 24 hours (status = 'scheduled')
--      c) Leads in "Neu Terminieren": latest appt failed, no new scheduled appt
--    All checks are idempotent — duplicate notifications within the same day
--    are skipped.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.generate_due_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

  -- -------------------------------------------------------------------------
  -- a) Follow-up due today
  -- -------------------------------------------------------------------------
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
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.reference_id   = f.id
        AND n.type           = 'followup_due'
        AND n.created_at::date = CURRENT_DATE
    );

  -- -------------------------------------------------------------------------
  -- b) Appointment within the next 24 hours
  -- -------------------------------------------------------------------------
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
    'Termin heute: ' || a.title,
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

  -- -------------------------------------------------------------------------
  -- c) Lead needs rescheduling ("Neu Terminieren" column)
  --    Fires when:
  --      - Lead is not won/lost
  --      - At least one appointment failed (rescheduled/no_show/cancelled)
  --      - No new scheduled appointment exists
  -- -------------------------------------------------------------------------
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
    l.organization_id,
    l.assigned_to,
    'reschedule_needed',
    'leads',
    l.id,
    'Neu terminieren: ' || p.first_name || ' ' || p.last_name,
    'Dieser Lead wartet auf einen neuen Termin.'
  FROM public.leads l
  JOIN public.prospects p ON p.id = l.prospect_id
  WHERE
    l.status NOT IN ('won', 'lost')
    AND l.assigned_to IS NOT NULL
    -- Has at least one failed appointment
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.lead_id = l.id
        AND a.status IN ('rescheduled', 'no_show', 'cancelled')
    )
    -- But no currently scheduled appointment
    AND NOT EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.lead_id = l.id
        AND a.status = 'scheduled'
    )
    -- Idempotency: skip if already notified today
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.reference_id   = l.id
        AND n.type           = 'reschedule_needed'
        AND n.created_at::date = CURRENT_DATE
    );

END;
$$;

-- =============================================================================
-- 3. Daily schedule via pg_cron (07:00 UTC)
--    Requires: pg_cron extension enabled in Supabase → Settings → Extensions
--    If pg_cron is not available, use the /api/notifications/generate route
--    triggered by an external cron service (e.g. cron-job.org).
-- =============================================================================

DO $outer$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'generate-due-notifications',
      '0 7 * * *',
      'SELECT public.generate_due_notifications()'
    );
  END IF;
END;
$outer$;
