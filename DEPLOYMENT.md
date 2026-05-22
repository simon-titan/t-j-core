# Deployment Guide — T&J CRM

> Schritt-für-Schritt von Zero zu Production auf Vercel + Supabase.

---

## Voraussetzungen

- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm i -g supabase`)
- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`) — optional
- GitHub Repository (Public oder Private)

---

## Schritt 1 — Supabase Projekt anlegen

1. Gehe zu [supabase.com](https://supabase.com) → **New Project**
2. **Region:** `eu-central-1` (Frankfurt) für EU-Datenschutz
3. Wähle ein starkes Datenbank-Passwort und sichere es
4. Nach Erstellung notiere dir:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (geheim halten!)
   - **JWT Secret** → `SUPABASE_JWT_SECRET`

---

## Schritt 2 — Migrations ausführen

Im Supabase Dashboard → **SQL Editor**: Führe die Migrations in dieser Reihenfolge aus:

```
1. supabase/migrations/20260521000001_initial_schema.sql
2. supabase/migrations/20260521000002_rls_policies.sql
3. supabase/migrations/20260521000003_functions_triggers.sql
4. supabase/migrations/20260522000001_admin_additions.sql
5. supabase/migrations/20260522000001_crm_kanban.sql
6. supabase/migrations/20260522000002_notification_system.sql
7. supabase/migrations/20260522000003_onboarding.sql
8. supabase/migrations/20260522000004_onboarding_answer_unique.sql
9. supabase/migrations/20260523000001_performance_indexes.sql
```

Oder via CLI (lokal):
```bash
supabase db push
```

---

## Schritt 3 — Onboarding Workbook Seed

Im SQL Editor ausführen:
```
supabase/tj_workbook_seed.sql
```

Dieser Schritt befüllt die Onboarding-Module und Fragen (12 Module, alle aus dem Original-PDF).

---

## Schritt 4 — Entwicklungs-Seed ausführen (optional)

Nur für Entwicklungs-/Staging-Umgebungen. **Nicht in Production!**

```bash
# .env.local mit Production-Credentials befüllen
cp .env.example .env.local
# Werte eintragen, dann:
npx ts-node --project scripts/tsconfig.json scripts/seed.ts
```

Erstellt: 2 Orgs, 7 User, 20 Prospects, 50 Pitches, 20 Leads, Onboarding-Antworten.

---

## Schritt 5 — Supabase Auth Email Templates (Deutsch)

Im Dashboard → **Authentication → Email Templates**:

**Confirm signup:**
- Betreff: `Dein T&J CRM Konto – E-Mail bestätigen`
- Body: `Hallo, bitte bestätige deine E-Mail-Adresse: {{ .ConfirmationURL }}`

**Reset password:**
- Betreff: `T&J CRM – Passwort zurücksetzen`
- Body: `Klicke hier, um dein Passwort zurückzusetzen: {{ .ConfirmationURL }}`

---

## Schritt 6 — Supabase Realtime konfigurieren

Im Dashboard → **Database → Replication**:

Nur diese Tabellen für Realtime aktivieren:
- ✅ `notifications` (NotificationBell braucht Live-Updates)
- ✅ `leads` (optional: Live-Kanban-Updates)

Alle anderen Tabellen: **deaktiviert** lassen.

---

## Schritt 7 — Notification Cron einrichten

Die Route `POST /api/notifications/generate` generiert tägliche Benachrichtigungen.
Sie wird durch `CRON_SECRET` im Authorization-Header gesichert.

**Option A: cron-job.org (kostenlos)**
1. Account anlegen auf [cron-job.org](https://cron-job.org)
2. Neuen Cronjob: täglich 08:00 Uhr
3. URL: `https://deine-domain.vercel.app/api/notifications/generate`
4. Header: `Authorization: Bearer <dein-CRON_SECRET>`

**Option B: Vercel Cron Jobs** (Vercel Pro)
```json
// vercel.json ergänzen:
{
  "crons": [{
    "path": "/api/notifications/generate",
    "schedule": "0 8 * * *"
  }]
}
```

---

## Schritt 8 — Vercel Projekt anlegen

1. Gehe zu [vercel.com](https://vercel.com) → **New Project**
2. GitHub Repository importieren
3. Framework: **Next.js** (auto-detected)
4. **Environment Variables** setzen (alle aus `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ...
SUPABASE_SERVICE_ROLE_KEY       = eyJ...
SUPABASE_JWT_SECRET             = your-jwt-secret
NEXT_PUBLIC_APP_URL             = https://deine-domain.vercel.app
NEXT_PUBLIC_APP_NAME            = T&J CRM
CRON_SECRET                     = <random-string>
```

5. Klicke **Deploy**

---

## Schritt 9 — Custom Domain konfigurieren (optional)

Im Vercel Dashboard → **Settings → Domains**:
1. Domain hinzufügen (z.B. `crm.titandevelopment.de`)
2. DNS-Eintrag beim Domain-Anbieter setzen (CNAME auf `cname.vercel-dns.com`)
3. SSL wird automatisch von Vercel bereitgestellt

Danach `NEXT_PUBLIC_APP_URL` in Vercel Environment Variables auf die neue Domain aktualisieren und neu deployen.

---

## Schritt 10 — Supabase Auth Redirect URL aktualisieren

Im Dashboard → **Authentication → URL Configuration**:
- **Site URL:** `https://deine-domain.vercel.app`
- **Redirect URLs:** `https://deine-domain.vercel.app/auth/callback`

---

## Schritt 11 — Smoke Test

Nach dem ersten Deploy alle kritischen User Flows durchklicken:

### Auth
- [ ] Login mit korrekten Credentials funktioniert
- [ ] Login mit falschen Credentials zeigt Fehlermeldung
- [ ] Auth-geschützte Routen leiten zur Login-Seite

### Pitch Tracker (`/app/pitch-tracker`)
- [ ] Pitches laden korrekt
- [ ] Neuer Pitch erstellen → Toast erscheint, kein Page-Reload
- [ ] Pitch als beantwortet markieren → Toast
- [ ] Pitch löschen → Bestätigungsdialog → Toast

### CRM Kanban (`/app/crm`)
- [ ] Board lädt, Spalten sichtbar
- [ ] Karte ziehen → optimistisch verschoben, Toast
- [ ] Detail-Panel öffnen → Prospect-Daten sichtbar
- [ ] Neues Meeting erstellen → Karte wandert in korrekte Spalte

### Onboarding (`/app/onboarding`)
- [ ] Module-Übersicht lädt
- [ ] Modul öffnen, Frage beantworten → Auto-Save (Indikator: "Gespeichert")
- [ ] Fortschrittsbalken aktualisiert sich

### Notification Bell
- [ ] Glocke zeigt ungelesene Benachrichtigungen
- [ ] Klick auf Benachrichtigung → als gelesen markiert

### Admin Panel (`/admin`)
- [ ] Nur für super_admin erreichbar
- [ ] Org-Übersicht zeigt korrekte Daten
- [ ] User-Vorschau öffnet Onboarding-Antworten

### Mobile (375px Viewport)
- [ ] Kanban scrollt horizontal mit Swipe
- [ ] Pitch-Tabelle lesbar (kompaktes Layout)
- [ ] Admin Stats Cards 2-spaltig

---

## Troubleshooting

**Auth-Loop (immer zurück zu /login):**
- Prüfe `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase Auth Redirect URL korrekt gesetzt?

**RLS-Fehler (403 / leere Daten):**
- Migration 002 (`rls_policies.sql`) ausgeführt?
- `profiles`-Eintrag für den User vorhanden?

**Notifications erscheinen nicht:**
- Supabase Realtime für `notifications`-Tabelle aktiviert?
- `generate_due_notifications()` RPC-Funktion vorhanden (Migration 006)?
- Cron-Job korrekt konfiguriert?

**Build schlägt fehl:**
- `typescript.ignoreBuildErrors: true` ist gesetzt — TypeScript-Fehler werden ignoriert
- Runtime-Fehler in Browser-Console prüfen
