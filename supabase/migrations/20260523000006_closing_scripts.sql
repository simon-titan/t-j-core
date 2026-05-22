-- =============================================================================
-- Migration 20260523000006: Closing Skripte — T&J CRM
--   - Neuer Modul-Typ 'script'
--   - Tabelle script_template_steps (editierbare T&J-Vorlagen)
--   - Seed: 2 Module (1-Call / 2-Call) + Sections + Questions + Vorlage-Inhalte
-- Vollständig idempotent (NOT EXISTS guards, IF NOT EXISTS).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. onboarding_modules.type CHECK erweitern → 'script'
-- ---------------------------------------------------------------------------

ALTER TABLE public.onboarding_modules
  DROP CONSTRAINT IF EXISTS onboarding_modules_type_check;
ALTER TABLE public.onboarding_modules
  ADD CONSTRAINT onboarding_modules_type_check
  CHECK (type IN ('workbook', 'reference', 'script'));

-- ---------------------------------------------------------------------------
-- 2. script_template_steps — die T&J-Vorlage (von Admins editierbar)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.script_template_steps (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_slug TEXT        NOT NULL,
  step_number TEXT        NOT NULL DEFAULT '',
  title       TEXT        NOT NULL,
  step_type   TEXT        NOT NULL DEFAULT 'step'
                          CHECK (step_type IN ('group_header', 'step', 'substep', 'objection')),
  body        TEXT,
  bullets     JSONB,
  call_group  TEXT        CHECK (call_group IN ('setting', 'closing')),
  order_index INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_script_template_steps_module
  ON public.script_template_steps(module_slug, order_index);

ALTER TABLE public.script_template_steps ENABLE ROW LEVEL SECURITY;

-- read: alle eingeloggten User
DROP POLICY IF EXISTS "script_template_steps_select" ON public.script_template_steps;
CREATE POLICY "script_template_steps_select" ON public.script_template_steps
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- write: nur org_admin + super_admin
DROP POLICY IF EXISTS "script_template_steps_insert" ON public.script_template_steps;
CREATE POLICY "script_template_steps_insert" ON public.script_template_steps
  FOR INSERT WITH CHECK (
    public.get_my_role() = 'super_admin' OR public.get_my_role() = 'org_admin'
  );

DROP POLICY IF EXISTS "script_template_steps_update" ON public.script_template_steps;
CREATE POLICY "script_template_steps_update" ON public.script_template_steps
  FOR UPDATE USING (
    public.get_my_role() = 'super_admin' OR public.get_my_role() = 'org_admin'
  );

DROP POLICY IF EXISTS "script_template_steps_delete" ON public.script_template_steps;
CREATE POLICY "script_template_steps_delete" ON public.script_template_steps
  FOR DELETE USING (
    public.get_my_role() = 'super_admin' OR public.get_my_role() = 'org_admin'
  );

DROP TRIGGER IF EXISTS tr_updated_at_script_template_steps ON public.script_template_steps;
CREATE TRIGGER tr_updated_at_script_template_steps
  BEFORE UPDATE ON public.script_template_steps
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Seed Modul 1 — 1-Call Closing Skript (Sections + Questions)
-- ---------------------------------------------------------------------------

DO $seed1$
DECLARE
  m1  UUID;
  sid UUID;
  sec RECORD;
  v_order INT := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.onboarding_modules WHERE slug = 'closing-skript-1-call') THEN
    INSERT INTO public.onboarding_modules (slug, title, description, icon, order_index, type, is_active)
    VALUES (
      'closing-skript-1-call',
      '1-Call Closing Skript',
      'Bau dir dein eigenes Sales-Skript für den 1-Call-Close – Schritt für Schritt, basierend auf der bewährten T&J-Struktur.',
      'mic',
      10, 'script', true
    )
    RETURNING id INTO m1;

    FOR sec IN
      SELECT * FROM (VALUES
        ('Begrüßung',                 'Deine Begrüßung',            'Wie startest du locker ins Gespräch? T&J: „Hey [Name], freut mich, dass es geklappt hat.“'),
        ('Agenda',                    'Deine Agenda',               'Wie kündigst du den Ablauf an und holst dir das „Klingt fair?“ ab?'),
        ('Expertenstatus',            'Dein Expertenstatus',        'Was legitimiert dich? Deine Erfolge, dein Hintergrund, dein Warum.'),
        ('Warum bist du hier',        'Deine Einstiegsfrage',       'Wie holst du das Motiv des Prospects ab?'),
        ('Ist-Situation',             'Deine Ist-Fragen',           'Welche Fragen stellst du, um die aktuelle Lage vollständig zu verstehen?'),
        ('Soll-Situation',            'Deine Soll-Fragen',          'Wie ermittelst du den Wunschzustand und das Ziel?'),
        ('Gap',                       'Deine Gap-Frage',            'Wie machst du dem Prospect die Lücke zwischen Ist und Soll bewusst?'),
        ('Zusammenfassung',           'Deine Zusammenfassung',      'Wie fasst du Ist, Soll & Gap strukturiert zusammen und lässt es bestätigen?'),
        ('Motiv hinter dem Ziel',     'Deine Motiv-Fragen',         'Wie gräbst du nach dem persönlichen Warum (Skala 1-10)?'),
        ('Dein Pitch',                'Dein individueller Pitch',   'Angebot, Positionierung, Fokus auf Transformation, 2-3 Cases.'),
        ('Garantie',                  'Deine Garantie',             'Welche Garantie gibst du (falls vorhanden)? Keine Klauseln, kein Kleingedrucktes.'),
        ('Ablauf & Preis',            'Dein Ablauf & Preisansage',  'Ablauf in Bulletpoints + Preisansage. Nach dem Preis: ruhig bleiben.'),
        ('Nächste Schritte',          'Deine nächsten Schritte',    'Wie führst du in den Abschluss / Onboarding-Call?'),
        ('Einwandbehandlung',         'Deine Einwand-Antworten',    'Notiere deine eigenen Antworten auf die häufigsten Einwände (Geld, Bedenkzeit, Partner …).')
      ) AS t(sec_title, q_text, q_helper)
    LOOP
      v_order := v_order + 1;
      INSERT INTO public.onboarding_sections (module_id, title, order_index)
        VALUES (m1, sec.sec_title, v_order) RETURNING id INTO sid;
      INSERT INTO public.onboarding_questions (section_id, module_id, question_text, helper_text, type, order_index)
        VALUES (sid, m1, sec.q_text, sec.q_helper, 'textarea', 1);
    END LOOP;
  END IF;
END
$seed1$;

-- ---------------------------------------------------------------------------
-- 4. Seed Modul 2 — 2-Call Closing Skript (Sections + Questions)
-- ---------------------------------------------------------------------------

DO $seed2$
DECLARE
  m2  UUID;
  sid UUID;
  sec RECORD;
  v_order INT := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.onboarding_modules WHERE slug = 'closing-skript-2-call') THEN
    INSERT INTO public.onboarding_modules (slug, title, description, icon, order_index, type, is_active)
    VALUES (
      'closing-skript-2-call',
      '2-Call Closing Skript',
      'Dein eigenes Skript für den 2-Call-Close: Setting Call zur Qualifikation, Closing Call zum Abschluss.',
      'phone-call',
      11, 'script', true
    )
    RETURNING id INTO m2;

    FOR sec IN
      SELECT * FROM (VALUES
        ('Setting: Begrüßung',                'Deine Begrüßung (Setting)',          'Lockerer Einstieg in den Setting Call.'),
        ('Setting: Agenda',                   'Deine Agenda (Setting)',             'Ablauf ankündigen, „Klingt fair?“ abholen.'),
        ('Setting: Expertenstatus',           'Dein Expertenstatus (Setting)',      'Kurz: wer du bist und was dich legitimiert.'),
        ('Setting: Ist-Situation',            'Deine Ist-Fragen (Setting)',         'Aktuelle Lage vollständig verstehen.'),
        ('Setting: Soll-Situation',           'Deine Soll-Fragen (Setting)',        'Wunschzustand & Richtung klären.'),
        ('Setting: Zusammenfassung',          'Deine Zusammenfassung (Setting)',    'Ist & Soll strukturiert zusammenfassen und bestätigen lassen.'),
        ('Setting: Qualifikation',            'Deine Qualifikations-Fragen',        'Entscheider, Geld (grobe Spanne), Startzeitpunkt.'),
        ('Setting: Terminieren',              'Dein Terminierungs-Move',            'Closing Call in 1-3 Tagen festhalten, damit der Lead heiß bleibt.'),
        ('Closing: Begrüßung & Agenda',       'Dein Einstieg (Closing)',            'Begrüßung + Agenda für den Closing Call.'),
        ('Closing: Ist-Situation',            'Deine Ist-Fragen (Closing)',         'Aktuelle Situation sauber wieder aufnehmen.'),
        ('Closing: Zusammenfassung',          'Deine Zusammenfassung (Closing)',    'Ist & Soll erneut strukturiert bestätigen.'),
        ('Closing: Motiv hinter dem Ziel',    'Deine Motiv-Fragen (Closing)',       'Persönliches Warum + Skala 1-10.'),
        ('Closing: Dein Pitch',               'Dein Pitch (Closing)',               'Erlaubnis, Positionierung, Angebotsbeschreibung, 3 Dinge, Transformation.'),
        ('Closing: Preis & Stille',           'Deine Preisansage & Stille',         'Preis (ggf. mit Anker) nennen, dann Stille aushalten.'),
        ('Closing: Nächste Schritte & Linie', 'Deine nächsten Schritte',            'Abschluss + klare Linie: nur Ja oder Nein akzeptieren.')
      ) AS t(sec_title, q_text, q_helper)
    LOOP
      v_order := v_order + 1;
      INSERT INTO public.onboarding_sections (module_id, title, order_index)
        VALUES (m2, sec.sec_title, v_order) RETURNING id INTO sid;
      INSERT INTO public.onboarding_questions (section_id, module_id, question_text, helper_text, type, order_index)
        VALUES (sid, m2, sec.q_text, sec.q_helper, 'textarea', 1);
    END LOOP;
  END IF;
END
$seed2$;

-- ---------------------------------------------------------------------------
-- 5. Seed T&J Vorlage — Modul 1 (script_template_steps)
-- ---------------------------------------------------------------------------

DO $tpl1$
DECLARE
  st RECORD;
  v_order INT := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.script_template_steps WHERE module_slug = 'closing-skript-1-call') THEN
    FOR st IN
      SELECT * FROM (VALUES
        ('1',  'Begrüßung',                    'step',      $t$Hey [Name], freut mich, dass es geklappt hat.$t$, NULL::text),
        ('2',  'Agenda',                       'step',      $t$Beispiel: Heute geht es nur darum, zu verstehen, wo du stehst, was du erreichen willst und ob es überhaupt Sinn macht, dass wir über eine Zusammenarbeit sprechen.

Klingt fair?$t$, NULL),
        ('3',  'Expertenstatus',               'step',      $t$Beispiel Tom:$t$, $b$["6 Jahre im Sales", "Seit September mit dem Consulting hier und im 2ten Monat schon 5-stellig gegangen", "Mein GP Jerry hat auch 4 Jahre im Sales – wir haben uns im Februar zusammen getan: Tom&Jerry (haha)"]$b$),
        ('4',  'Warum bist du hier',           'step',      $t$Was genau hat dein Interesse geweckt, dass du dir jetzt die Zeit für dieses Thema nimmst?$t$, NULL),
        ('5',  'Ist-Situation',                'step',      $t$Beispiel Tom:

Wie gewinnst du aktuell deine Neukunden?$t$, $b$["Wie ist dein konkretes Vorgehen auf LinkedIn (Nachrichten, Content, Vernetzen)?", "Was nervt dich aktuell an der Akquise?", "Wie viele Kunden gewinnst du aktuell im Schnitt?", "Wie viel nimmst du aktuell pro Kunde (wie viel Profit)?"]$b$),
        ('6',  'Soll-Situation',               'step',      $t$Beispiel Tom:

Gibt es etwas, das du an deinem Akquiseprozess gerne ändern würdest?$t$, $b$["Inwiefern willst du LinkedIn als Vertriebskanal ausbauen?", "Wie viele Kunden willst du pro Monat gewinnen?"]$b$),
        ('7',  'Gap',                          'step',      $t$Was würdest DU sagen, ist der Grund, dass du noch nicht da bist?$t$, NULL),
        ('8',  'Zusammenfassung Ist, Soll & Gap', 'step',   $t$Wiederhole strukturiert, was dein Gegenüber gesagt hat.

Lass dir bestätigen, dass du alles korrekt verstanden hast.

Frage zusätzlich, ob es noch etwas Erwähnenswertes gibt, das bisher nicht angesprochen wurde.$t$, NULL),
        ('9',  'Motiv hinter dem Ziel',        'step',      $t$Warum willst du dieses Ziel erreichen?

Was ist dein persönliches Warum?

Wie wichtig ist dir das auf einer Skala von 1 bis 10?$t$, NULL),
        ('10', 'Dein Pitch',                   'step',      $t$Beispiel Tom:

Also, ich kann dir definitiv weiterhelfen.

Wir arbeiten mit [B2B-Dienstleistern] und helfen dabei, [konstant 3-5 Neukunden] im Monat über LinkedIn zu erreichen [ohne teure Ads oder Cold Calls].$t$, NULL),
        ('10.1', 'Angebotsbeschreibung',       'substep',   $t$$t$, $b$["Angebot & Positionierung", "Content & Personal Branding", "Systematisierter Outreach", "SALES"]$b$),
        ('10.2', 'Fokus auf Transformation',   'substep',   $t$$t$, $b$["NoBrainer Offer", "Sichtbarkeit, Expertenstatus, Trust", "Konstant qualifizierte Termine", "Funktionierende Call-Struktur für planbare Abschlüsse und Cash auf dem Konto"]$b$),
        ('10.3', 'Cases',                       'substep',   $t$Kurz und knackig: 2-3 Cases nennen, die im Best-Case Ähnlichkeiten mit deinem Gegenüber haben.$t$, NULL),
        ('11', 'Garantie (falls du eine hast)','step',      $t$Da jeder, mit dem wir bisher zusammengearbeitet haben, den ROI rausgeholt hat, gehen wir mit dem klaren Versprechen raus, dass du deinen Investitionsbetrag zu 100 % wieder rausholst – oder wir arbeiten kostenfrei mit dir weiter, bis du dieses Ziel erreicht hast.

→ Keine Klauseln, kein Kleingedrucktes$t$, NULL),
        ('11.1', 'Fragen zulassen',            'substep',   $t$Jetzt warten.

Der Prospect wird Fragen stellen, bis er ein klares Verständnis davon hat, wie dein Angebot funktioniert und wie es für ihn funktionieren kann.

Regeln:$t$, $b$["Immer nur die konkrete Frage beantworten", "Nicht abschweifen", "Danach wieder warten"]$b$),
        ('11.2', 'Ablauf der Zusammenarbeit',  'substep',   $t$In Bulletpoints erklären, wie die Zusammenarbeit aussieht. Nicht zu umfangreich erklären – probier, dich kurz zu halten.$t$, NULL),
        ('12', 'Preis',                         'step',      $t$Das Investment für das Angebot beträgt X €.

Nachdem du den Preis gesagt hast, bist du ruhig – kein Rechtfertigen oder Erklären.$t$, NULL),
        ('13', 'Nächste Schritte',              'step',      $t$Wenn der Kunde starten will:

Top, freut mich.

Lass uns kurz den Papierkram fertig machen, teile deinen Bildschirm und gehe das Angebot durch, frag deinen Gegenüber, ob alles so passt. (Angebot im Call bestätigen lassen)

Wann passt es dir für den Onboarding-Call?$t$, NULL),
        ('14', 'Einwandbehandlung',             'step',      $t$Falls Einwände kommen – bleib ruhig, stell Fragen und führe zurück zum Wert.$t$, NULL),
        ('', 'Wie viel Zeit habe ich, um eine Entscheidung zu treffen?', 'objection', $t$Wie viel Zeit brauchst du denn, um eine Entscheidung zu treffen?

Über was genau willst du nachdenken? Lass uns deine Fragen gerne jetzt klären.

Antwort abwarten: „Ich muss meine Finanzen checken / Ich muss mit meinem Partner darüber sprechen / Ich treffe keine spontanen Entscheidungen.“

Wann checkst du deine Finanzen?
Wann sprichst du mit deinem Partner darüber?
Wann bist du in der Lage, eine Entscheidung zu treffen?

Auf Antwort warten und schauen, dass die Bedenkzeit max. 24h beträgt.
Ok, super. Dann lass uns einen Termin für morgen Nachmittag festhalten.$t$, NULL),
        ('', 'Ich habe kein Geld / Das ist zu teuer / Ich kann mir das nicht leisten', 'objection', $t$Lass uns gleich gerne über deine finanzielle Situation reden – aber gibt es denn irgendwas, was dir inhaltlich nicht passt?

Wenn wir nämlich eine perfekte Lösung haben, dann werden wir uns auch finanziell einig.

Also ist dir wichtig, dass wir das Geld schnell wieder reinholen und sich die Investition für dich gelohnt hat?
Ist das denn etwas, was du wirklich machen möchtest?
Wie können wir das für dich möglich machen? (z. B. Zahlungsplan)
Angenommen, ich bringe dich zum Ziel – ist es dann noch eine Frage des Preises?
Ist es eine Frage des Geldes oder des Wertes?
Warum wählst du keine günstige Alternative?
Warum denkst du, sind andere Kunden bereit, dieses Investment zu tätigen?

Ich kann verstehen, dass du es auf den ersten Blick teuer findest. Wir sind auch definitiv im hochpreisigen Segment unterwegs. Was unsere Dienstleistung allerdings so wertvoll macht, ist XYZ.
(Von zu teuer, über teuer, über hochpreisig, zu wertvoll)$t$, NULL),
        ('', 'Sobald ich den ersten Kunden gewinne, starten wir.', 'objection', $t$Okay, sag mir, wie das genau funktionieren soll?

Antwort abwarten.

Also, das heißt, du möchtest jetzt so weitermachen wie bisher – was nicht sonderlich gut funktioniert, deswegen hattest du dir ja den Call gebucht. Und durch einen komischen Zufall wird es so gut funktionieren, dass du dir auf einmal Geld zur Seite legen kannst, um zu investieren? Ist das richtig?

Antwort abwarten: „Ja, das klingt irgendwie blöd, ich weiß…“

Ok, also wie können wir das Ganze für dich möglich machen?$t$, NULL),
        ('', 'Ich brauche noch mehr Bedenkzeit', 'objection', $t$Entweder du machst mit deinem Gegenüber einen kurzen Reality-Check:

• Horror-Szenario: Was wäre das Schlimmste, was passieren kann?
• Reality-Check: Was ändert sich bis morgen?
• Bedarf: Löst unser Angebot dein Problem?
• Vertrauen: Möchtest du mit uns zusammenarbeiten?
• Budget: Hast du genug Budget (oder kannst es besorgen)?

Oder du gehst in den Deep Dive:

Ok, ich will ja auch, dass du die richtige Entscheidung triffst. Welche Themen haben wir noch nicht geklärt, über die du nachdenken möchtest? Genau das ist ja der Grund für das Gespräch. Stell mir gerne alle Fragen, damit du alles hast, was du brauchst, um die richtige Entscheidung zu treffen.$t$, NULL),
        ('', 'Der Zeitpunkt passt gerade nicht.', 'objection', $t$Wann wird denn ein guter Zeitpunkt sein, um zu starten?
Wann genau ist denn ein guter Zeitpunkt, um die Probleme zu lösen?
Macht es Sinn, dass du wartest, diese Probleme zu lösen?
Was wäre denn, wenn es noch viel schlimmer wird? Was machst du dann?
Warum hast du dich ursprünglich auf das Gespräch eingelassen?$t$, NULL),
        ('', 'Ich muss nochmal drüber nachdenken.', 'objection', $t$Was muss passieren, damit wir heute ins Geschäft kommen?

Die Erfahrung hat gezeigt, dass einige Kunden noch einmal intensiv über die Entscheidung nachdenken wollen. Ich würde das auch an deiner Stelle machen. Was hältst du davon, wenn wir das gemeinsam tun?

Weißt du, wenn Menschen mir sagen, sie möchten darüber nachdenken, meinen sie eigentlich „nein“, sagen es aber nicht, weil sie mich nicht verletzen möchten. Ist das hier der Fall? Du willst mich nicht vor den Kopf stoßen, oder?$t$, NULL),
        ('', 'Ich melde mich nächste Woche wieder.', 'objection', $t$Ehrlich gesagt … meiner Erfahrung nach meldet sich dann nie jemand zurück.

Angenommen, wir kommen heute nicht ins Geschäft – was magst du an dem Angebot nicht?
Wer ist denn dein Vorbild?
Wie würde er oder sie jetzt handeln?
Was würde er oder sie jetzt zu dir sagen?
(Vorbilder sind meistens erfolgreich, und erfolgreiche Menschen treffen direkt Entscheidungen.)

Hand aufs Herz: Macht es überhaupt Sinn, dass ich warte?$t$, NULL),
        ('', 'Ich muss meinen Partner fragen.', 'objection', $t$Ok, das verstehe ich. Lass mich dir eine Frage stellen, damit ich dich auch richtig verstehe:

Du willst nur ein kurzes Go von deinem Partner bekommen und dann starten wir durch? Oder gibt es noch etwas anderes?

Bei „Ja, wir können durchstarten“:
Mega, wann werdet ihr gesprochen haben? Lass uns einen Termin festhalten.

Bei „Nein, es gibt noch Fragen“:
Würde es helfen, wenn du, dein Partner und ich gemeinsam einen Call machen, damit wir alle offenen Fragen beantworten können?$t$, NULL),
        ('', 'Ich brauche das nicht.', 'objection', $t$Was passiert, wenn wir das Thema nicht zusammen angehen?
Was würde sich in deinem Leben verändern, wenn wir gemeinsam deine Ziele erreichen?

Genau das hat unser Kunde X am Anfang auch gesagt. Heute hat er (gewünschtes Ergebnis) und bereut es nicht, schon früher gestartet zu haben.

Ich habe eine Frage dazu: Wenn du das nicht brauchst und das alleine besser kannst, warum sprechen wir dann heute überhaupt miteinander?$t$, NULL),
        ('', 'Ich hab schonmal ein Coaching gekauft und es hat nicht funktioniert.', 'objection', $t$Wem vertraust du gerade nicht? Mir oder dir?

Welches Ergebnis unserer Zusammenarbeit würde denn das Investment zu einem absoluten No-Brainer machen?
(Genau das gehen wir an.)$t$, NULL),
        ('', 'Ich brauche eine Garantie.', 'objection', $t$Klar, ich garantiere dir: Wenn du so weitermachst wie bisher, wird sich in deinem Leben oder Business nichts verändern.

Aber wir garantieren dir auch, dass unser System funktioniert (Garantie nennen).

Falls du aber gerade nach einem Ausweg suchst, bevor wir gestartet sind, sind wir kein guter Fit. Beides ist für mich fein. Ich will nur, dass WENN wir starten, du auch committed bist, dass es funktioniert.

Denn die Leute, die einen Grund finden wollen, wieso es nicht funktioniert, finden den auch in der Regel.$t$, NULL),
        ('', 'Warum sollte ich mit dir zusammenarbeiten?', 'objection', $t$Warum sollte ich denn mit DIR zusammenarbeiten?$t$, NULL),
        ('', 'Ich habe keine Zeit für die Zusammenarbeit.', 'objection', $t$Wie viele Stunden hast du denn pro Woche für dieses Projekt zur Verfügung?
Angenommen, inhaltlich passt alles – wann könnten wir denn starten?$t$, NULL),
        ('', 'Ich möchte zuerst eine kostenlose Probe haben.', 'objection', $t$Arbeitest du auch umsonst oder ohne Honorar?$t$, NULL),
        ('', 'Ich will definitiv nicht kaufen.', 'objection', $t$Bevor wir auflegen, eine kurze Frage:
Was müsste passieren, damit du dich nicht für einen anderen Dienstleister entscheidest?$t$, NULL)
      ) AS t(num, title, stype, body, bullets)
    LOOP
      v_order := v_order + 1;
      INSERT INTO public.script_template_steps (module_slug, step_number, title, step_type, body, bullets, order_index)
        VALUES ('closing-skript-1-call', st.num, st.title, st.stype,
                NULLIF(st.body, ''), st.bullets::jsonb, v_order);
    END LOOP;
  END IF;
END
$tpl1$;

-- ---------------------------------------------------------------------------
-- 6. Seed T&J Vorlage — Modul 2 (script_template_steps, mit call_group)
-- ---------------------------------------------------------------------------

DO $tpl2$
DECLARE
  st RECORD;
  v_order INT := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.script_template_steps WHERE module_slug = 'closing-skript-2-call') THEN
    FOR st IN
      SELECT * FROM (VALUES
        ('',  'Setting Call',       'group_header', $t$$t$, NULL::text, 'setting'),
        ('1', 'Begrüßung',          'step', $t$Hey [Name], freut mich, dass es geklappt hat.$t$, NULL, 'setting'),
        ('2', 'Agenda',             'step', $t$Heute geht es nur darum, zu verstehen, wo du aktuell stehst, was du erreichen willst und ob es überhaupt Sinn macht, dass wir über eine Zusammenarbeit sprechen.

Klingt fair?$t$, NULL, 'setting'),
        ('3', 'Expertenstatus',     'step', $t$Kurz erklären, wer du bist und was dich legitimiert, deinem Gegenüber in diesem Bereich weiterhelfen zu können.$t$, NULL, 'setting'),
        ('4', 'Ist-Situation',      'step', $t$Ziel ist es, die aktuelle Lage vollständig zu verstehen.

Fragen:
Wie gewinnst du aktuell Kunden?
Was tust du konkret, um Ziel X zu erreichen?
Was funktioniert davon gut?
Was funktioniert nicht?

Stelle alle weiteren relevanten Fragen, die du brauchst, um die Situation deines Gegenübers vollständig zu verstehen.$t$, NULL, 'setting'),
        ('5', 'Soll-Situation',     'step', $t$Ziel ist es, Klarheit über Wunschzustand und Richtung zu bekommen.

Fragen:
Wie sieht es im Best Case für dich aus?
Was wäre dein Ziel in 6/12 Monaten?

Kurz prüfen, ob seine Ziele grundsätzlich zu deiner Dienstleistung passen.$t$, NULL, 'setting'),
        ('6', 'Zusammenfassung Ist & Soll', 'step', $t$Wiederhole, was dein Gegenüber gesagt hat, und fasse es strukturiert zusammen.
Lass dir bestätigen, dass du alles richtig verstanden hast.

Frage zusätzlich: Gibt es noch etwas Wichtiges, das wir bisher nicht erfasst haben und das erwähnenswert ist?$t$, NULL, 'setting'),
        ('7', 'Qualifikation',      'step', $t$Jetzt qualifizieren: Entscheider, Geld und Startzeitpunkt sauber abklopfen.$t$, NULL, 'setting'),
        ('7.1', 'Entscheider',      'substep', $t$Kannst du alleine entscheiden oder gibt es einen Geschäftspartner oder Mitentscheider?
Falls ja, muss diese Person beim nächsten Call mit dabei sein.$t$, NULL, 'setting'),
        ('7.2', 'Geld',             'substep', $t$Hast du grundsätzlich die Möglichkeit, Summe X zu investieren?
Nenne eine grobe Preisspanne.
Konkrete Zahlen folgen im nächsten Call, abhängig vom tatsächlichen Bedarf.$t$, NULL, 'setting'),
        ('7.3', 'Startzeitpunkt',   'substep', $t$Angenommen, alles passt fachlich und menschlich – kannst du direkt starten?
Oder gibt es aktuell etwas, das dich davon abhält, direkt in die Umsetzung mit uns zu gehen?

Falls der Kunde nicht startklar ist: Call neu terminieren auf einen Zeitpunkt, zu dem er bereit ist.$t$, NULL, 'setting'),
        ('8', 'Terminieren',        'step', $t$Innerhalb von 1 bis 3 Tagen den Closing Call terminieren, damit der Lead heiß bleibt.$t$, NULL, 'setting'),
        ('',  'Closing Call',       'group_header', $t$$t$, NULL, 'closing'),
        ('1', 'Begrüßung',          'step', $t$Hey [Name], freut mich, dass es geklappt hat.$t$, NULL, 'closing'),
        ('2', 'Agenda',             'step', $t$Heute geht es nur darum, zu verstehen, wo du stehst, was du erreichen willst und ob es überhaupt Sinn macht, dass wir über eine Zusammenarbeit sprechen.

Klingt fair?$t$, NULL, 'closing'),
        ('3', 'Expertenstatus',     'step', $t$Kurz erklären, wer du bist und was dich legitimiert, deinem Gegenüber in diesem Bereich weiterhelfen zu können.$t$, NULL, 'closing'),
        ('4', 'Ist-Situation',      'step', $t$Wie gewinnst du aktuell Kunden?
Was tust du konkret, um Ziel X zu erreichen?
Was funktioniert gut?
Was funktioniert nicht?

Alle relevanten Fragen stellen, um die aktuelle Situation sauber zu verstehen.$t$, NULL, 'closing'),
        ('5', 'Soll-Situation',     'step', $t$Wie sieht es im Best Case für dich aus?
Was wäre dein Ziel in 6/12 Monaten?

Kurz prüfen, ob seine Ziele mit deiner Dienstleistung zusammenpassen.$t$, NULL, 'closing'),
        ('6', 'Zusammenfassung Ist & Soll', 'step', $t$Wiederhole strukturiert, was dein Gegenüber gesagt hat.
Lass dir bestätigen, dass du alles korrekt verstanden hast.
Frage zusätzlich, ob es noch etwas Erwähnenswertes gibt, das bisher nicht angesprochen wurde.$t$, NULL, 'closing'),
        ('7', 'Motiv hinter dem Ziel', 'step', $t$Warum willst du dieses Ziel erreichen?
Was ist dein persönliches Warum?
Wie wichtig ist dir das auf einer Skala von 1 bis 10?$t$, NULL, 'closing'),
        ('8', 'Dein Pitch',         'step', $t$Einleitung:
Kriegen wir alles hin, das ist kein Hexenwerk.
Ich erkläre dir kurz den Ablauf, okay?$t$, NULL, 'closing'),
        ('8.1', 'Erlaubnis einholen', 'substep', $t$Also, ich kann dir definitiv weiterhelfen.
Möchtest du, dass ich dir kurz vorstelle, wie das abläuft?
Auf ein klares „Ja“ warten.$t$, NULL, 'closing'),
        ('8.2', 'Positionierung',   'substep', $t$Ich arbeite normalerweise mit [Zielgruppe] und helfe dabei, [Ziel X] zu erreichen ohne [Pain X].
In der Regel dauert das [X Tage].

Danach warten – auf Aussagen wie: „Erzähl mir mehr“ / „Wie machst du das?“$t$, NULL, 'closing'),
        ('8.3', 'Angebotsbeschreibung', 'substep', $t$Jetzt beschreibst du, was du tust und wie es wirkt, ohne das Problem konkret zu lösen.

Wichtig:
• Bleib vage
• Sprich nicht über Prozesse
• Sprich nicht über Features
• Nenne keinen Preis

Fokus ausschließlich auf: Ergebnis, Transformation, Vorteile.

Dieser Teil ist individuell und muss von dir selbst ausgearbeitet werden. Schreibe ihn auf, übe ihn und halte ihn unter 3-6 min.$t$, NULL, 'closing'),
        ('8.4', 'Die 3 Dinge',      'substep', $t$Es gibt 3 Dinge, die für den Erfolg unserer Kunden entscheidend sind:
• Ein gutes Angebot
• Menschen, die dieses Angebot kaufen möchten
• Einen Prozess, um diese Menschen zu erreichen

Dieser Teil ist individuell und muss von dir selbst ausgearbeitet werden.$t$, NULL, 'closing'),
        ('8.5', 'Fokus auf Transformation', 'substep', $t$Beispiel:
Du bist auf Social Media aktiv, postest regelmäßig und hast bereits den ein oder anderen Sales Call im Kalender. Dein größter Knackpunkt ist aktuell dein Angebot.

Wenn wir dein Angebot gemeinsam überarbeiten, wirst du mehr Sales Calls buchen, weil mehr Menschen mit deiner Message resonieren. Und du wirst in den Sales Calls mehr Kunden gewinnen, weil dein Angebot zu einem echten No Brainer wird.

Was hältst du davon?$t$, NULL, 'closing'),
        ('9', 'Fragen zulassen',    'step', $t$Jetzt warten.
Der Prospect wird Fragen stellen, bis er ein klares Verständnis davon hat, wie dein Angebot funktioniert und wie es für ihn funktionieren kann.

Regeln:
• Immer nur die konkrete Frage beantworten
• Nicht abschweifen
• Danach wieder warten

Wenn du dein Angebot bewusst vage präsentierst, wird dein Gegenüber so lange fragen, bis er das vollständige Bild hat, das er benötigt.$t$, NULL, 'closing'),
        ('10', 'Preis nennen',      'step', $t$Nur wenn explizit nach dem Preis gefragt wird.

Option 1:
Das Investment für das Angebot beträgt X Euro.

Option 2 (mit Preisanker):
Normalerweise liegt die Betreuung bei 6000 Euro. Ich habe jedoch festgestellt, dass Kunden, die sich schnell entscheiden, die besten Ergebnisse erzielen. Deshalb hast du die Möglichkeit, für 4500 Euro zu starten, wenn du die Entscheidung jetzt hier mit mir triffst.$t$, NULL, 'closing'),
        ('11', 'Stille halten',     'step', $t$Jetzt nichts sagen. Stille aushalten. 1-2 Minuten sind normal.

Warten auf Signale wie:
• Ok, wie geht es weiter?
• Ok, wie können wir loslegen?
• Ja, ich bin dabei!$t$, NULL, 'closing'),
        ('12', 'Nächste Schritte',  'step', $t$Wenn der Kunde starten will:
Top, freut mich! Lass uns den Papierkram schnell fertig machen.
Wann passt dir unser Onboarding oder Kickoff?$t$, NULL, 'closing'),
        ('13', 'Klare Linie',       'step', $t$Alles, was nicht ein klares Ja oder Nein ist, wird nicht akzeptiert:
• Könntest du mir etwas per E-Mail zuschicken?
• Wie kann ich mich später wieder melden?
• Ich muss darüber nachdenken.
• Ich muss noch meinen Geschäftspartner fragen.

Wenn es gar nicht anders geht: sauber nachfassen oder neu terminieren.$t$, NULL, 'closing')
      ) AS t(num, title, stype, body, bullets, cgroup)
    LOOP
      v_order := v_order + 1;
      INSERT INTO public.script_template_steps (module_slug, step_number, title, step_type, body, bullets, call_group, order_index)
        VALUES ('closing-skript-2-call', st.num, st.title, st.stype,
                NULLIF(st.body, ''), st.bullets::jsonb, st.cgroup, v_order);
    END LOOP;
  END IF;
END
$tpl2$;
