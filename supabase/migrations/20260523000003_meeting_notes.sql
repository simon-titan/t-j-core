-- Meeting Notes: live note-taking during appointments
CREATE TABLE IF NOT EXISTS meeting_notes (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id  UUID        NOT NULL REFERENCES appointments(id)  ON DELETE CASCADE,
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  note_type       TEXT        NOT NULL DEFAULT 'note'
                              CHECK (note_type IN ('note', 'action', 'question', 'objection', 'insight')),
  content         TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meeting_notes_appointment ON meeting_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_org         ON meeting_notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_created_at  ON meeting_notes(appointment_id, created_at);

ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members can manage meeting notes" ON meeting_notes;
CREATE POLICY "org members can manage meeting notes"
  ON meeting_notes
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS trg_meeting_notes_updated_at ON meeting_notes;
CREATE TRIGGER trg_meeting_notes_updated_at
  BEFORE UPDATE ON meeting_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
