-- ============================================
-- T&J WORKBOOK SEED SCRIPT
-- 12 Module, alle Fragen aus dem Original-PDF
-- ============================================

-- Clear existing seed data
DELETE FROM onboarding_questions;
DELETE FROM onboarding_sections;
DELETE FROM onboarding_modules;

INSERT INTO onboarding_modules (slug, title, description, icon, order_index, type) VALUES
('angebot', 'Angebot', 'Definiere und perfektioniere dein Angebot – von der Kernleistung bis zum High-Conversion Offer.', 'package', 1, 'workbook'),
('zielgruppenanalyse', 'Zielgruppenanalyse', 'Verstehe deine Zielgruppe strategisch – wer passt perfekt zu dir, wer hat Kaufkraft und Bedarf.', 'users', 2, 'workbook'),
('linkedin-profil-optimierung', 'LinkedIn Profil Optimierung', 'Optimiere dein LinkedIn-Profil – von der Headline bis zur Featured Section.', 'linkedin', 3, 'workbook'),
('linkedin-outreach-workbook', 'LinkedIn Outreach Workbook', 'Baue deine persönliche Outreach-Strategie für LinkedIn auf – Schritt für Schritt zur eigenen Outreach-Map.', 'send', 4, 'workbook'),
('direct-pitch', 'Baue deinen Direct Pitch', 'Entwickle deine persönliche LinkedIn-Nachricht – kurz, ehrlich, menschlich – die sich natürlich liest und trotzdem verkauft.', 'zap', 5, 'workbook'),
('follow-up-system', 'Follow-Up System', 'Lerne Follow-Ups strategisch zu nutzen – nicht als Druckmittel, sondern als Werkzeug für Vertrauen, Verbindlichkeit und Umsatz.', 'repeat', 6, 'workbook'),
('netzwerkaufbau', 'Netzwerkaufbau', 'Baue gezielt dein LinkedIn-Netzwerk auf – Vernetzungsanfragen und Kommentare als deinen stärksten Hebel.', 'network', 7, 'workbook'),
('content-plan', 'Content-Plan', 'Entwickle deine Personal Brand und Content-Strategie auf LinkedIn – von Zielen bis zum Wochenplan.', 'calendar', 8, 'workbook'),
('sales', 'Sales', 'Verändere dein Mindset zum Thema Verkauf – lerne authentisch zu verkaufen ohne Druck zu machen.', 'trending-up', 9, 'workbook'),
('closing-skript-1', 'Closing Skript 1-Call-Close', 'Das vollständige Skript für den direkten Close in einem einzigen Call – von Small Talk bis Preis.', 'phone-call', 10, 'reference'),
('closing-skript-2', 'Closing Skript 2-Call-Close', 'Das 2-Call-System: Setting Call zur Qualifikation + Closing Call zum Abschluss.', 'phone', 11, 'reference'),
('einwandbehandlung', 'Einwandbehandlung', 'Meistere die häufigsten Einwände im Sales-Gespräch – mit konkreten Formulierungen für jede Situation.', 'shield', 12, 'reference');

-- Sections für Modul: Angebot
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Dein Angebot', 'Die Grundlagen deines Angebots klar definieren.', 1
FROM onboarding_modules WHERE slug = 'angebot';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was genau bietest du an?', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Dein Angebot' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was haben deine Kunden davon? Welches Problem löst du / welches Ziel erreichen sie?', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Dein Angebot' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was muss dein Kunde investieren? Hast du Pakete?', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Dein Angebot' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Erkläre hier im Detail, welche Leistungen dein Produkt umfasst. Wie genau werden diese Leistungen umgesetzt – digital, persönlich oder über Partner bzw. Dritte?', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Dein Angebot' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Hast du Up/Cross-Sell Angebote?', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Dein Angebot' AND s.order_index = 1;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Boni, Garantien & Wertsteigerung', 'Baue dein bezahltes Angebot so auf, dass es Vertrauen, Klarheit und Begeisterung auslöst.', 2
FROM onboarding_modules WHERE slug = 'angebot';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Das Zielergebnis: Beschreibe glasklar, welches Ergebnis deine Kunden am Ende erreichen. Formuliere es so, dass man sich das Endergebnis bildlich vorstellen kann.', 'Beispiel: Nicht ''besseres Marketing'' – sondern ''mehr Kunden durch ein LinkedIn-System, das messbar funktioniert''', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Boni, Garantien & Wertsteigerung' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Dringlichkeit & Limitierung: Was macht es dringlich, jetzt zu handeln? Wie kannst du dein Angebot limitieren?', 'Beispiele: Nur wenige Plätze pro Monat, nur bis Datum X buchbar, limitierte Boni oder persönliche Betreuung, Preis steigt nach Datum X, Programm öffnet nur einmal im Quartal.', 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Boni, Garantien & Wertsteigerung' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Garantie & Sicherheit: Formuliere deine Garantie so, dass der Kunde denkt: ''Ich kann eigentlich nichts verlieren.''', 'Beispiele: Wenn du nach X Tagen keine Ergebnisse siehst, arbeiten wir weiter – kostenlos. Die zweite Zahlung ist erst fällig, wenn du dein erstes messbares Ergebnis hast.', 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Boni, Garantien & Wertsteigerung' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Bonus Stack: Welche Boni machst du dein Angebot wertvoller – ohne es billiger zu machen?', 'Tipps: Nenne Boni erst nach dem Preis. Jeder Bonus muss ein konkretes Problem lösen. Gib jedem Bonus einen Namen und erkläre seinen Nutzen. Setze klare Werte z.B. ''LinkedIn Hook Creator – Wert: 249 €''', 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Boni, Garantien & Wertsteigerung' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Letzter Feinschliff: Überprüfe dein Angebot – wie nah bist du am Kunden dran (Support-Level)? Wie viel Arbeit übernimmst du – DIY, Done-with-You oder Done-for-You? Wie schnell kommen Kunden ans Ziel?', 'Wenn du diese Punkte klar hast, steht dein Angebot nicht einfach nur – es verkauft sich logisch.', 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Boni, Garantien & Wertsteigerung' AND s.order_index = 2;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Die 4 Hebel des Wertes', 'Verstehe wie wahrgenommener Wert entsteht und wie du ihn gezielt erhöhst.', 3
FROM onboarding_modules WHERE slug = 'angebot';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Zielergebnis: Was will dein Kunde wirklich erreichen?', 'Je größer das Ziel, je schneller der Weg, je sicherer der Erfolg und je geringer der Aufwand – desto höher der Wert.', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie sieht Erfolg für ihn konkret aus?', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie fühlt sich das Ergebnis für ihn an – emotional und praktisch?', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Erfolgschancen: Warum sollte dein Kunde glauben, dass er es mit dir schafft?', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Beweise oder Beispiele kannst du zeigen (z.B. Cases, Erfahrungen, Referenzen)?', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie stellst du sicher, dass der Kunde nicht scheitert?', NULL, 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Zeit bis zum Ziel: Wie schnell kann dein Kunde mit ersten Ergebnissen rechnen?', NULL, 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Prozesse oder Systeme beschleunigen den Weg zum Ergebnis?', NULL, 'textarea', NULL::jsonb, 8
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was bremst aktuell, und wie kannst du diese Hindernisse entfernen?', NULL, 'textarea', NULL::jsonb, 9
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Aufwand & Opfer: Was muss dein Kunde selbst tun, um Ergebnisse zu sehen?', NULL, 'textarea', NULL::jsonb, 10
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was kannst du ihm abnehmen oder vereinfachen?', NULL, 'textarea', NULL::jsonb, 11
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie können deine Kunden aktiv an der Lösung mitarbeiten?', NULL, 'textarea', NULL::jsonb, 12
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Teile deines Angebots lassen sich individuell anpassen?', NULL, 'textarea', NULL::jsonb, 13
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Tools oder Vorlagen stellst du bereit, damit Kunden selbst Ergebnisse erzielen können?', NULL, 'textarea', NULL::jsonb, 14
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Fazit: Wie kannst du den wahrgenommenen Wert deines Angebots gezielt erhöhen?', NULL, 'textarea', NULL::jsonb, 15
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie lautet dein finales High-Conversion Offer in einem Satz?', NULL, 'textarea', NULL::jsonb, 16
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'Die 4 Hebel des Wertes' AND s.order_index = 3;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'B2B Themen Übersicht', 'Markiere alle Themen, in denen du fachlich tiefgehend kompetent bist und zu denen du seriös beraten oder Dienstleistungen anbieten kannst.', 4
FROM onboarding_modules WHERE slug = 'angebot';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Erstmalige Gründung: Welche Themen kannst du hier abdecken?', 'z.B. Geschäftsmodelle, Businessplan, Finanzierung, Rechtsform, technisches Setup, Übergang vom Nebenberuf', 'checkbox_group', '["Welche Geschäftsmodelle gibt es?", "Welches Geschäftsmodell passt zu mir?", "Wie starte ich ein bestimmtes Geschäftsmodell nebenberuflich?", "Wie erstelle ich einen Businessplan?", "Wie finanziere ich meine Gründung?", "Welche rechtlichen Themen sind relevant?", "Welche steuerlichen Themen muss ich beachten?", "Welche Rechtsform ist sinnvoll?", "Welches technische Setup benötige ich?", "Wie gestalte ich den Übergang vom Nebenberuf in die Selbstständigkeit?", "Wie baue ich ein professionelles Unternehmen auf?"]'::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'B2B Themen Übersicht' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Neukundengewinnung und Marketing: Welche Themen kannst du hier abdecken?', NULL, 'checkbox_group', '["Wie gewinne ich mehr Kunden?", "Wie gewinne ich bessere Kunden?", "Wie kann ich meine Preise erhöhen?", "Wie entwickle ich zusätzliche Angebote?", "Wie steigere ich den Kundenwert?", "Wie baue ich Vertrauen in Produkt und Marke auf?", "Wie automatisiere ich meine Neukundengewinnung?", "Wie erhöhe ich meine Sichtbarkeit?", "Wie generiere ich mehr Inbound-Leads über Online-Marketing?", "Wie finde ich mehr Outbound-Leads für Kaltakquise?", "Wie verbessere ich meine Kaltakquise?", "Wie verbessere ich mein Content Marketing?", "Wie erhöhe ich meine Abschlussquote?"]'::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'B2B Themen Übersicht' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Mitarbeiter, Recruiting und Führung: Welche Themen kannst du hier abdecken?', NULL, 'checkbox_group', '["Wie finde ich neue Mitarbeiter?", "Wie besetze ich gezielt einzelne Positionen?", "Wie finde ich geeignete Führungskräfte?", "Wie werde ich ein attraktiver Arbeitgeber?", "Wie gestalte ich den Bewerbungsprozess?", "Wie gestalte ich Arbeitsverträge korrekt?", "Wie gestalte ich das Onboarding?", "Wie arbeite ich Mitarbeiter richtig ein?", "Wie motiviere und führe ich Mitarbeiter?", "Wie steigere ich die Produktivität?"]'::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'B2B Themen Übersicht' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Systematisierung und Digitalisierung: Welche Themen kannst du hier abdecken?', NULL, 'checkbox_group', '["Wie systematisiere ich Prozesse?", "Wie dokumentiere ich Prozesse sauber?", "Wie sollte die interne Kommunikation ablaufen?", "Welche Software oder SaaS-Lösungen sind sinnvoll?", "Wie schütze ich meine Daten und Systeme?", "Wie verbinde ich Systeme über Schnittstellen?"]'::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'angebot' AND s.title = 'B2B Themen Übersicht' AND s.order_index = 4;

-- Sections für Modul: Zielgruppenanalyse
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Traumkunde & Qualifikation', 'Definiere deinen idealen Kunden und woran du ihn erkennst.', 1
FROM onboarding_modules WHERE slug = 'zielgruppenanalyse';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Traumkunde: Beschreibe deinen absoluten Traumkunden in 2–3 Sätzen.', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Traumkunde & Qualifikation' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Ergebnis in 30–60 Tagen: Bei welchen Kundentypen kannst du realistisch ein sichtbares Ergebnis in 30–60 Tagen liefern?', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Traumkunde & Qualifikation' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Schmerz: Welche Gruppe spürt den Schmerz, den du löst, am stärksten?', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Traumkunde & Qualifikation' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Kaufkraft: Wer hat das Geld, um deine Lösung zu bezahlen, ohne lange zu überlegen?', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Traumkunde & Qualifikation' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Entscheider: Sprichst du direkt mit Entscheidern (Founder, CEO) oder mit Angestellten, die erst fragen müssen?', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Traumkunde & Qualifikation' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Skalierbarkeit: Lässt sich mit dieser Gruppe später systematisch skalieren – ähnliche Probleme, gleiche Sprache?', NULL, 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Traumkunde & Qualifikation' AND s.order_index = 1;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Probleme der Zielgruppe', 'Tauche tief in die Welt deiner Zielkunden ein.', 2
FROM onboarding_modules WHERE slug = 'zielgruppenanalyse';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was sind die 3 größten Probleme deiner Zielgruppe aktuell?', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Probleme der Zielgruppe' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Warum schaffen sie es bisher nicht, das zu lösen?', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Probleme der Zielgruppe' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Lösungen haben sie schon probiert, die nicht funktioniert haben?', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Probleme der Zielgruppe' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Fehler machen sie immer wieder?', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Probleme der Zielgruppe' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was kostet es sie, ihr Problem nicht zu lösen – Zeit, Geld, Nerven, Chancen?', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Probleme der Zielgruppe' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was ist ihr eigentliches Ziel hinter dem Ziel? (z.B. mehr Kunden = Freiheit, Sicherheit, Status)', NULL, 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Probleme der Zielgruppe' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie wollen sie sich fühlen, wenn das Problem gelöst ist?', NULL, 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Probleme der Zielgruppe' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche falschen Überzeugungen oder Einwände blockieren sie?', NULL, 'textarea', NULL::jsonb, 8
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'zielgruppenanalyse' AND s.title = 'Probleme der Zielgruppe' AND s.order_index = 2;

-- Sections für Modul: LinkedIn Profil Optimierung
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Headline', 'Deine Headline ist das Wichtigste auf deinem Profil – sie entscheidet ob jemand bleibt.', 1
FROM onboarding_modules WHERE slug = 'linkedin-profil-optimierung';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine Headline: Formuliere deine finale LinkedIn-Headline.', 'Tipp: Sprich über deine Kunden, nicht über dich. Kein ''Ich bin CEO von…'' – sondern klarer Nutzen. Formel: Ich helfe [Zielgruppe] dabei, [Ziel/Ergebnis] zu erreichen, indem [deine Methode], ganz ohne [typischen Einwand].', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Headline' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Weitere Headline-Ideen: Erkläre kurz dein Business.', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Headline' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Zeig dein Angebot in einer Headline-Variante.', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Headline' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Zielgruppe + Nutzen kombinieren.', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Headline' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Teile dein Mindset in einer Headline-Variante.', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Headline' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Social Proof einbauen.', NULL, 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Headline' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Call to Action als Headline-Variante.', NULL, 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Headline' AND s.order_index = 1;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Die One-Liner Geschichte & About-Text', 'Dein Info-Text erzählt deine Geschichte – menschlich, aber professionell.', 2
FROM onboarding_modules WHERE slug = 'linkedin-profil-optimierung';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Die One-Liner Geschichte – Das Problem:', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Die One-Liner Geschichte & About-Text' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Die One-Liner Geschichte – Die Lösung:', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Die One-Liner Geschichte & About-Text' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Die One-Liner Geschichte – Das Ergebnis:', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Die One-Liner Geschichte & About-Text' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Infotext – Starte mit einer starken Hook:', 'Dein Text sollte sich wie eine kleine Reise lesen. Schreib menschlich, aber professionell. Max. 2000 Zeichen.', 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Die One-Liner Geschichte & About-Text' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Über dich – Wer du bist:', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Die One-Liner Geschichte & About-Text' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Warum man dir zuhören sollte:', NULL, 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Die One-Liner Geschichte & About-Text' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Dein Warum:', NULL, 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Die One-Liner Geschichte & About-Text' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine Werte:', NULL, 'textarea', NULL::jsonb, 8
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Die One-Liner Geschichte & About-Text' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine Arbeitsweise:', NULL, 'textarea', NULL::jsonb, 9
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Die One-Liner Geschichte & About-Text' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Social Proof (Cases, Zahlen, Testimonials):', NULL, 'textarea', NULL::jsonb, 10
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Die One-Liner Geschichte & About-Text' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Dein Angebot im About-Text:', NULL, 'textarea', NULL::jsonb, 11
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Die One-Liner Geschichte & About-Text' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Call to Action am Ende des About-Texts:', NULL, 'textarea', NULL::jsonb, 12
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Die One-Liner Geschichte & About-Text' AND s.order_index = 2;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Profilbild & Banner', 'Dein visueller erster Eindruck auf LinkedIn.', 3
FROM onboarding_modules WHERE slug = 'linkedin-profil-optimierung';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Checkliste Profilbild: Welche Punkte hast du umgesetzt?', 'Professionelles Bild, Blick in die Kamera, gute Beleuchtung, passende Kleidung, neutraler Hintergrund, farblich abgestimmt auf Banner.', 'checkbox_group', '["Professionelles Bild (kein Selfie oder Urlaubsfoto)", "Blick in die Kamera", "Gute Beleuchtung (Tageslicht oder Softbox)", "Passende Kleidung (wie bei Kundenterminen)", "Neutraler oder leicht unscharfer Hintergrund", "Farblich abgestimmt auf dein Banner"]'::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Profilbild & Banner' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine Banner Message:', 'Ziel: Sofort vermitteln, wer du bist, was du machst und welchen Mehrwert du bietest. Halte es schlicht, verwende dein Branding.', 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Profilbild & Banner' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Dein Call to Action im Banner:', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Profilbild & Banner' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was platzierst du in deiner Featured Section?', 'Empfohlen: Erfolgreiche Posts, Kunden-Ergebnisse oder Case Studies, Presseartikel/Interviews, dein Angebot oder Funnel, Buchungslink/Calendly.', 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-profil-optimierung' AND s.title = 'Profilbild & Banner' AND s.order_index = 3;

-- Sections für Modul: LinkedIn Outreach Workbook
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Fundament & Zielpersonen', 'Definiere dein Ziel und wen du anschreiben wirst.', 1
FROM onboarding_modules WHERE slug = 'linkedin-outreach-workbook';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was ist dein Ziel mit LinkedIn-Outreach?', 'z.B. Calls legen, Netzwerk aufbauen, Marktfeedback bekommen', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Fundament & Zielpersonen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie viele Menschen möchtest du pro Tag anschreiben?', 'Empfohlen: 10–20, hochwertig und persönlich', 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Fundament & Zielpersonen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wen sprichst du an? (Branche, Position, Unternehmensgröße, ICP)', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Fundament & Zielpersonen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Woran erkennst du, ob jemand wirklich passt? (Budget, Bedarf, Mindset)', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Fundament & Zielpersonen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Nenne drei typische Merkmale deiner Traumkunden:', 'Beispiel: Agenturen mit mindestens 30.000 € Monatsumsatz, die organisch gewachsen sind, aber jetzt mit LinkedIn oder Paid Ads skalieren wollen.', 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Fundament & Zielpersonen' AND s.order_index = 1;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Erstkontakt & Pitch', 'Formuliere deinen Einstieg und deinen Pitch.', 2
FROM onboarding_modules WHERE slug = 'linkedin-outreach-workbook';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was ist dein Standard-Einstieg in neue Gespräche?', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Erstkontakt & Pitch' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie bringst du einen persönlichen Bezug rein? (Profil, Post, Kommentar, Gemeinsamkeit)', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Erstkontakt & Pitch' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Formuliere deine erste Nachricht:', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Erstkontakt & Pitch' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine Lead-Typ Regeln: Wie gehst du mit Signal-Leads (warm) vs. Connection-Leads (kalt) um?', 'Signal-Leads: haben dir eine Anfrage geschickt, waren auf deinem Profil, haben geliked oder kommentiert. Connection-Leads: kennen dich noch nicht, du machst den ersten Schritt.', 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Erstkontakt & Pitch' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Icebreaker (persönlich, ehrlich oder humorvoll):', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Erstkontakt & Pitch' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Proof (Case, Ergebnis oder Erfahrung):', NULL, 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Erstkontakt & Pitch' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Soft-CTA (z.B. ''Lass uns mal quatschen''):', NULL, 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Erstkontakt & Pitch' AND s.order_index = 2;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Follow-Ups', 'Deine Follow-Up Sequenz ausformulieren.', 3
FROM onboarding_modules WHERE slug = 'linkedin-outreach-workbook';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie viele Follow-ups setzt du ein? (2–4 empfohlen)', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Follow-Ups' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Follow-up 1:', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Follow-Ups' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Follow-up 2:', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Follow-Ups' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Follow-up 3:', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Follow-Ups' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Follow-up 4 (optional):', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Follow-Ups' AND s.order_index = 3;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Einwände & Terminierung', 'Bereite dich auf die häufigsten Einwände im Chat vor.', 4
FROM onboarding_modules WHERE slug = 'linkedin-outreach-workbook';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie reagierst du auf ''keine Zeit''?', 'Best Practice: ''Verständlich, jeder ist voll. Genau deswegen baue ich Systeme, die Zeit sparen, nicht fressen. Oft reicht 1–2 h am Anfang, danach läuft''s im Hintergrund. Soll ich dir zeigen, wie das bei dir aussehen könnte?''', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Einwände & Terminierung' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie reagierst du auf ''kein Budget''?', 'Best Practice: ''Fair. Budget ist selten das Problem – der ROI ist es. Wenn jeder Euro 3–5 zurückbringt, ist es kein Kostenfaktor mehr. Willst du sehen, wie das bei anderen geklappt hat?''', 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Einwände & Terminierung' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie reagierst du auf ''kein Bedarf''?', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Einwände & Terminierung' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine Top 3 Do''s im Outreach:', 'Do''s: Schreibe kurz und persönlich, nutze Humor wenn es passt, sei konstant (täglich kleines Volumen), frag nach echten Problemen.', 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Einwände & Terminierung' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine Top 3 Don''ts im Outreach:', 'Don''ts: Keine Preise im Chat, nicht unfreundlich bei Ablehnung, kein Copy-Paste.', 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Einwände & Terminierung' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie fragst du nach einem Call, ohne pushy zu wirken?', NULL, 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Einwände & Terminierung' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie bestätigst du Termine über LinkedIn?', NULL, 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Einwände & Terminierung' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche KPIs sind für dich entscheidend? (z.B. Antwortquote, Call-Quote, Close-Rate)', NULL, 'textarea', NULL::jsonb, 8
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Einwände & Terminierung' AND s.order_index = 4;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Abschluss-Checkliste', 'Stelle sicher, dass du alles vorbereitet hast.', 5
FROM onboarding_modules WHERE slug = 'linkedin-outreach-workbook';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Abschluss-Checkliste: Was hast du vorbereitet?', NULL, 'checkbox_group', '["Ziele und Volumen definiert", "Zielpersonen festgelegt", "Erste Nachricht formuliert", "Follow-ups vorbereitet", "Pitch geschrieben", "Do''s und Don''ts festgelegt", "Einwände vorbereitet", "Terminprozess geklärt", "Tracking-Methode gesetzt"]'::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'linkedin-outreach-workbook' AND s.title = 'Abschluss-Checkliste' AND s.order_index = 5;

-- Sections für Modul: Baue deinen Direct Pitch
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Dein Direct Pitch aufbauen', 'Schritt für Schritt zu deiner eigenen Pitch-Nachricht.', 1
FROM onboarding_modules WHERE slug = 'direct-pitch';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Begrüßung: Wie startest du locker und persönlich?', 'Beispiele: Hallo [Name], Hey [Name], Moin [Name]. Kein ''Sehr geehrter Herr'' oder ''Guten Tag''. Zeig im ersten Satz, dass du kein Bot bist.', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'direct-pitch' AND s.title = 'Dein Direct Pitch aufbauen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Individueller Part: 1–2 Sätze, die zeigen, dass du wirklich auf die Person geachtet hast.', 'Beispiele: ''Hey [Name], dein letzter Post über [Thema] war richtig stark.'' / ''Hab gesehen, du bist auch in [Ort] – kleine Welt!''', 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'direct-pitch' AND s.title = 'Dein Direct Pitch aufbauen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Vorstellung & Branding: Wer du bist, was du machst – wie ein Mensch, nicht wie ein Unternehmen.', 'Beispiel: ''Ich bin Tom, wahrscheinlich der einzige 22-Jährige, der mehr Zeit auf LinkedIn verbringt als auf TikTok!''', 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'direct-pitch' AND s.title = 'Dein Direct Pitch aufbauen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Retention-Framing (optional): Zeig, dass du connecten willst, nicht direkt pitchen.', 'Beispiel: ''Ich suche Leute, die LinkedIn nicht als digitalen Lebenslauf sehen, sondern als Vertriebskanal.''', 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'direct-pitch' AND s.title = 'Dein Direct Pitch aufbauen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Proof & Cases: Nenne 2–3 Punkte, die wirklich Gewicht haben.', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'direct-pitch' AND s.title = 'Dein Direct Pitch aufbauen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Warum ihr ein Match seid: Erkläre, warum du genau dieser Person schreibst.', NULL, 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'direct-pitch' AND s.title = 'Dein Direct Pitch aufbauen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Call-to-Action: Kurz, locker, kein Druck.', 'Beispiele: ''Wie sieht''s aus – wollen wir gemeinsam deinen LinkedIn aufbauen?'' / ''Worst case gehst du mit 2–3 Tipps raus, best case mit einem klaren Plan.''', 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'direct-pitch' AND s.title = 'Dein Direct Pitch aufbauen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Abschluss & Signatur:', NULL, 'textarea', NULL::jsonb, 8
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'direct-pitch' AND s.title = 'Dein Direct Pitch aufbauen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Dein fertiger Direct Pitch (alle Teile zusammenführen):', 'Schreibe hier deinen kompletten, fertigen Pitch.', 'textarea', NULL::jsonb, 9
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'direct-pitch' AND s.title = 'Dein Direct Pitch aufbauen' AND s.order_index = 1;

-- Sections für Modul: Follow-Up System
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Theorie & Psychologie', 'Verstehe warum Follow-Ups der wichtigste Teil von Sales sind.', 1
FROM onboarding_modules WHERE slug = 'follow-up-system';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Die 10 Follow-Up Arten – lese sie durch und markiere welche du einsetzen wirst:', '1. Reminder (neutral, kein Druck) 2. Trigger (frech, charmant) 3. Value (zeigt Mitdenken) 4. Social-Proof 5. Humor (Pattern Interrupt) 6. Reframe (bei ''kein Bedarf'') 7. FOMO (Dringlichkeit ohne Druck) 8. Callback (Reaktivierung) 9. Content (subtiler Touchpoint) 10. Exit (letzter Versuch mit Stil)', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'follow-up-system' AND s.title = 'Theorie & Psychologie' AND s.order_index = 1;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Dein Follow-Up System', 'Baue dein persönliches, planbares Follow-Up-System.', 2
FROM onboarding_modules WHERE slug = 'follow-up-system';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Mini Worksheet: Wie viele Follow-Ups hast du letzte Woche geschrieben?', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'follow-up-system' AND s.title = 'Dein Follow-Up System' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie viele hättest du eigentlich schreiben können?', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'follow-up-system' AND s.title = 'Dein Follow-Up System' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Follow-Up Art funktioniert bei dir am besten?', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'follow-up-system' AND s.title = 'Dein Follow-Up System' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Bei welchen Leads willst du diese Woche nochmal nachfassen?', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'follow-up-system' AND s.title = 'Dein Follow-Up System' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie kannst du Follow-Ups persönlicher gestalten?', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'follow-up-system' AND s.title = 'Dein Follow-Up System' AND s.order_index = 2;

-- Sections für Modul: Netzwerkaufbau
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Vernetzungsanfragen', 'Definiere deine Strategie für gezielte Vernetzungsanfragen.', 1
FROM onboarding_modules WHERE slug = 'netzwerkaufbau';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine ICP Kriterien: Wen möchtest du gezielt vernetzen?', 'Vorqualifizierung: mind. 2 Jahre Vollzeit-Selbstständig oder hohe Position. Beispiel: Der 17-jährige Webdesigner ist wahrscheinlich nicht kaufkräftig genug.', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'netzwerkaufbau' AND s.title = 'Vernetzungsanfragen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine tägliche Lead-Quelle: Wo findest du täglich neue relevante Profile?', 'Tipps: Netzwerk der ICPs, ''Weitere Profile für Sie''-Reiter, Sales Navigator oder Filter.', 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'netzwerkaufbau' AND s.title = 'Vernetzungsanfragen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'LinkedIn Checkliste: Was machst du täglich und wöchentlich?', 'Täglich 15–20 Min: 5–10 Kommentare bei relevanten Kontakten, 20 Vernetzungsanfragen. Wöchentlich: 100–120 neue Kontakte, 20–30 gute Kommentare.', 'checkbox_group', '["Täglich: 5–10 Kommentare bei relevanten Kontakten und Zielgruppen", "Täglich: 20 Vernetzungsanfragen verschickt", "Wöchentlich: 100–120 neue Kontakte erreicht", "Wöchentlich: 20–30 gute Kommentare verfasst", "Montag–Freitag morgens 7:30–10:00 Uhr kommentiert", "Erste 60 Minuten nach Post-Veröffentlichung für Interaktion genutzt"]'::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'netzwerkaufbau' AND s.title = 'Vernetzungsanfragen' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine A-Kontakte: Welche Personen sind für dein Netzwerk besonders wertvoll?', 'Führe eine Liste mit A-Kontakten – Personen mit denen du regelmäßig interagierst.', 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'netzwerkaufbau' AND s.title = 'Vernetzungsanfragen' AND s.order_index = 1;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Kommentar-Strategie', 'Kommentare schlagen Likes – dein Name bleibt länger sichtbar.', 2
FROM onboarding_modules WHERE slug = 'netzwerkaufbau';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Icebreaker-Kommentar: Dein Beispiel für einen lockeren, menschlichen Kommentar.', 'Beispiel: ''Musste bei deinem Punkt lachen – hatten wir letzte Woche genauso im Team.''', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'netzwerkaufbau' AND s.title = 'Kommentar-Strategie' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Kluge Ergänzung: Dein Beispiel für einen Kommentar mit echtem Mehrwert.', 'Beispiel: ''Interessant. In Projekten mit Mittelständlern haben wir gesehen, dass …''', 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'netzwerkaufbau' AND s.title = 'Kommentar-Strategie' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Persönlicher Insight: Dein Beispiel für eine kurze eigene Erfahrung mit klarer Lesson.', 'Beispiel: ''Ich hab 3 Monate gebraucht, um Meetings auf 25 Min. zu kürzen. Seitdem: mehr Fokus, bessere Entscheidungen.''', 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'netzwerkaufbau' AND s.title = 'Kommentar-Strategie' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Respektvoller Konter: Dein Beispiel für einen anderen Blickwinkel, konstruktiv formuliert.', 'Beispiel: ''Sehe es etwas anders: Bei KMU funktioniert X besser als Y. Wie sind deine Erfahrungen?''', 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'netzwerkaufbau' AND s.title = 'Kommentar-Strategie' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Story-Kommentar: Dein Beispiel für eine Mini-Anekdote mit Fazit.', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'netzwerkaufbau' AND s.title = 'Kommentar-Strategie' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Brücken-Kommentar: Dein Beispiel für einen Verweis auf ähnliche Situation oder Content.', NULL, 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'netzwerkaufbau' AND s.title = 'Kommentar-Strategie' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine Kommentar-Strategie: Wo und bei wem kommentierst du bevorzugt?', 'Tipp: Kommentiere bevorzugt bei Creators, deren Zielgruppe deine Wunschkunden sind. So nutzt du deren Reichweite, ohne selbst zu posten.', 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'netzwerkaufbau' AND s.title = 'Kommentar-Strategie' AND s.order_index = 2;

-- Sections für Modul: Content-Plan
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Ziele, KPIs & Commitment', 'Definiere klar was du mit deinem Content erreichen willst.', 1
FROM onboarding_modules WHERE slug = 'content-plan';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Chancen oder Möglichkeiten erhoffst du dir durch deine Personal Brand?', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Ziele, KPIs & Commitment' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche messbaren Ergebnisse willst du erreichen? (z.B. Neukunden, Follower, Umsatz)', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Ziele, KPIs & Commitment' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Mit wem möchtest du dich vernetzen oder in Kontakt kommen?', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Ziele, KPIs & Commitment' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Posting-Frequenz: Wie oft kannst du konstant pro Woche posten?', 'Empfehlung: 3–5 gute Posts die Woche. Zwischen 7:30 und 8:00 Uhr ist am meisten Traffic auf LinkedIn.', 'checkbox_group', '["1x pro Woche", "2x pro Woche", "3x pro Woche", "5x pro Woche"]'::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Ziele, KPIs & Commitment' AND s.order_index = 1;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Positionierung & Themen', 'Definiere wofür du stehst und welche Themen du bespielst.', 2
FROM onboarding_modules WHERE slug = 'content-plan';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was ist deine Expertise? (max. 1–3 Bereiche)', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Positionierung & Themen' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Themen willst du regelmäßig bespielen, um deine Expertise zu verankern?', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Positionierung & Themen' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was macht dich einzigartig?', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Positionierung & Themen' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was sind die größten Fragen deiner Zielkunden?', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Positionierung & Themen' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was sind die wichtigsten Themen in deinem Expertengebiet?', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Positionierung & Themen' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Womit beschäftigst du dich besonders intensiv?', NULL, 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Positionierung & Themen' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Erfahrungen oder Meinungen hast du, die nur du teilen kannst?', NULL, 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Positionierung & Themen' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was hast du in den letzten Jahren gelernt, das du weitergeben möchtest?', NULL, 'textarea', NULL::jsonb, 8
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Positionierung & Themen' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche drei Hauptthemen sollen deine Content-Strategie bestimmen?', NULL, 'textarea', NULL::jsonb, 9
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Positionierung & Themen' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie willst du die Content-Mischung gestalten?', 'Optionen: Storytelling (persönliche Anekdoten), Proof & Authority (Cases, Zahlen), Education/How-To, Antipositionierung (gegen schlechte Praktiken), Community & Kultur (triggert Diskussion).', 'textarea', NULL::jsonb, 10
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Positionierung & Themen' AND s.order_index = 2;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Wochenplanung', 'Plane deine konkrete Content-Woche.', 3
FROM onboarding_modules WHERE slug = 'content-plan';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Montag:', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Wochenplanung' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Dienstag:', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Wochenplanung' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Mittwoch:', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Wochenplanung' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Donnerstag:', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Wochenplanung' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Freitag:', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Wochenplanung' AND s.order_index = 3;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Personal Brand Style', 'Entwickle den unverwechselbaren Stil deiner Personal Brand.', 4
FROM onboarding_modules WHERE slug = 'content-plan';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Step 1 – Welche Aktivitäten, Routinen oder Ereignisse gehören regelmäßig zu deinem Alltag?', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Personal Brand Style' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Step 2 – Welche Wörter beschreiben diese Aktivitäten oder Erfahrungen am besten?', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Personal Brand Style' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Step 3 – Wie kannst du diese Elemente in wiederkehrende Content-Themen verwandeln?', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Personal Brand Style' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Step 4 – Welche visuellen oder sprachlichen Elemente sollen sich in deinem Content wiederholen?', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Personal Brand Style' AND s.order_index = 4;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Step 5 – Test-Plan: Welche Elemente oder Formate willst du testen? (Variante A vs. B)', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Personal Brand Style' AND s.order_index = 4;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Storytelling 1x1', 'Lerne wie du Posts schreibst, die Menschen wirklich lesen.', 5
FROM onboarding_modules WHERE slug = 'content-plan';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Einstieg, der hängen bleibt: Wie kannst du mit einem Satz starten, der sofort Aufmerksamkeit zieht?', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Storytelling 1x1' AND s.order_index = 5;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Aussage, Frage oder Beobachtung würdest du bringen, um dein Publikum sofort zu catchen?', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Storytelling 1x1' AND s.order_index = 5;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie kannst du direkt Spannung aufbauen, ohne künstlich zu wirken?', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Storytelling 1x1' AND s.order_index = 5;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Problem zeigen: Welches Problem oder Dilemma willst du sichtbar machen?', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'content-plan' AND s.title = 'Storytelling 1x1' AND s.order_index = 5;

-- Sections für Modul: Sales
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Sales Mindset', 'Verkaufen ist kein Druck, sondern Dienstleistung.', 1
FROM onboarding_modules WHERE slug = 'sales';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Vorteile erlebt dein idealer Kunde, wenn er dein Wissen nutzt? Wie verändert sich sein Alltag, sein Business, seine Denkweise?', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Sales Mindset' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was passiert, wenn dein idealer Kunde dich nie findet oder dein Wissen nicht nutzt? Was verliert er dadurch?', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Sales Mindset' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie willst du in Zukunft über Verkauf denken? Formuliere deine eigene Definition in 2–3 Sätzen.', 'Verkaufen ist kein Überreden, sondern Klarheit. Keine Jagd, sondern Verantwortung.', 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Sales Mindset' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was kannst du tun, um dich im nächsten Sales-Gespräch sicherer zu fühlen?', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Sales Mindset' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welches der fünf Mindsets brauchst du am stärksten, um selbstbewusster aufzutreten?', '1. Ich bin ein Problemlöser, kein Bittsteller. 2. Gute Kunden investieren gerne in Qualität. 3. Hohe Preise schaffen bessere Ergebnisse. 4. Klare Prozesse erzeugen Vertrauen. 5. Ein Nein ist kein Rückschritt.', 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Sales Mindset' AND s.order_index = 1;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, '30 Gründe warum man bei dir kaufen soll', 'Formuliere klar, was dich, dein Unternehmen, dein Angebot und dein Team einzigartig macht.', 2
FROM onboarding_modules WHERE slug = 'sales';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine Person – Warum tust du, was du tust?', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Erfahrung oder Qualifikation hebt dich von anderen ab?', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Eigenschaft deiner Persönlichkeit schafft sofort Vertrauen?', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was verstehen deine Kunden sofort, wenn sie mit dir sprechen?', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was ist dein persönlicher USP als Berater, Coach oder Unternehmer?', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine Werte – Wofür steht dein Unternehmen, unabhängig von Trends?', NULL, 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Werte bestimmen deine Entscheidungen und deine Arbeit?', NULL, 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Philosophie zieht sich durch deine gesamte Zusammenarbeit mit Kunden?', NULL, 'textarea', NULL::jsonb, 8
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was ist dir wichtiger als Umsatz oder Wachstum?', NULL, 'textarea', NULL::jsonb, 9
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Stärke oder Qualität schätzen Kunden am meisten an deiner Arbeitsweise?', NULL, 'textarea', NULL::jsonb, 10
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Dein Produkt – Welches Hauptproblem löst dein Angebot für Kunden?', NULL, 'textarea', NULL::jsonb, 11
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Warum funktioniert dein Ansatz oder deine Methode besser als andere Lösungen?', NULL, 'textarea', NULL::jsonb, 12
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Ergebnisse oder Veränderungen erleben Kunden typischerweise nach der Zusammenarbeit?', NULL, 'textarea', NULL::jsonb, 13
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was spart dein Kunde durch dich – Zeit, Geld, Aufwand oder Risiko?', NULL, 'textarea', NULL::jsonb, 14
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was ist das Besondere an deiner Art, Ergebnisse zu liefern?', NULL, 'textarea', NULL::jsonb, 15
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Dein Team – Welche Fähigkeiten oder Erfahrungen ergänzen sich in deinem Team ideal?', NULL, 'textarea', NULL::jsonb, 16
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche messbaren Erfolge oder Referenzen sprechen für euch als Team?', NULL, 'textarea', NULL::jsonb, 17
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was unterscheidet euer internes Mindset von klassischen Agenturen oder Freelancern?', NULL, 'textarea', NULL::jsonb, 18
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Weitere Alleinstellungsmerkmale – Welche Form von Service oder Betreuung hebt dich von anderen ab?', NULL, 'textarea', NULL::jsonb, 19
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Proofs oder Ergebnisse kannst du belegen, die Vertrauen schaffen?', NULL, 'textarea', NULL::jsonb, 20
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was ist der wichtigste Grund, warum Kunden dich langfristig weiterempfehlen?', NULL, 'textarea', NULL::jsonb, 21
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = '30 Gründe warum man bei dir kaufen soll' AND s.order_index = 2;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Emotion & Logik', 'Menschen kaufen mit Emotionen und rechtfertigen mit Logik – decke beides ab.', 3
FROM onboarding_modules WHERE slug = 'sales';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Emotionale Ebene – Was ist das größte Ziel, das dein Kunde mit deiner Lösung erreichen möchte?', NULL, 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Wie soll sich der Kunde fühlen, nachdem er dieses Ziel erreicht hat? (z.B. stolz, sicher, erleichtert)', NULL, 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche kurz- und langfristigen Vorteile wünscht sich der Kunde von deinem Angebot?', NULL, 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Problem – Was ist die größte Herausforderung deines Kunden, die ihn davon abhält, sein Ziel zu erreichen?', NULL, 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Ängste oder Zweifel könnten den Kunden davon abhalten, deinem Angebot zu vertrauen?', NULL, 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Was passiert im Leben des Kunden, wenn das Problem ungelöst bleibt?', NULL, 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Pain – Welche Frustrationen oder Belastungen empfindet dein Kunde aktuell aufgrund seines Problems?', NULL, 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche emotionalen Auswirkungen (z.B. Stress, Unsicherheit) hat das Problem auf den Kunden?', NULL, 'textarea', NULL::jsonb, 8
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Kosten (Zeit, Geld, Energie) entstehen dem Kunden durch das ungelöste Problem?', NULL, 'textarea', NULL::jsonb, 9
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Pleasure – Wie würde sich das Leben des Kunden ändern, wenn das Problem gelöst ist?', NULL, 'textarea', NULL::jsonb, 10
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche positiven Gefühle (z.B. Erleichterung, Freude, Selbstvertrauen) möchte der Kunde erleben?', NULL, 'textarea', NULL::jsonb, 11
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Logische Ebene – Welche Garantien kannst du bieten, um dem Kunden die Angst vor einem Fehlkauf zu nehmen?', NULL, 'textarea', NULL::jsonb, 12
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche bisherigen Erfolge kannst du zeigen, die den Nutzen deines Angebots beweisen?', NULL, 'textarea', NULL::jsonb, 13
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche Zahlen oder Fakten kannst du präsentieren, um den Nutzen deines Angebots zu untermauern?', NULL, 'textarea', NULL::jsonb, 14
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Welche konkreten Ergebnisse sind realistisch und messbar?', NULL, 'textarea', NULL::jsonb, 15
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'sales' AND s.title = 'Emotion & Logik' AND s.order_index = 3;

-- Sections für Modul: Closing Skript 1-Call-Close
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, '1-Call-Close Skript', 'Dein Leitfaden für den Closing-Call. Lies dieses Modul vor jedem Call durch und mache deine Notizen.', 1
FROM onboarding_modules WHERE slug = 'closing-skript-1';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, '1. Small Talk – Notizen:', 'Kurzer Beziehungsaufbau und Warm-up. Beispiele: Wie geht''s dir? Von wo rufst du an? Lass uns in den Call starten.', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-1' AND s.title = '1-Call-Close Skript' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, '2. Frame den Call – Deine Formulierung:', 'Vorschlag: ''Ich werde dir ein paar Fragen zu dir und deinem Business stellen. Wenn es so aussieht, als könnte ich dir helfen, zeige ich dir kurz, wie eine Zusammenarbeit aussieht. Am Ende kannst du entscheiden ob du dabei sein willst oder nicht. Klingt das fair?'' → Auf das ''Ja'' warten.', 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-1' AND s.title = '1-Call-Close Skript' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, '3. Motivation – Deine Fragen um die Beweggründe zu verstehen:', 'Beispiele: Also, wieso sprechen wir heute? Was meinst du mit...? Kannst du mir mehr dazu erzählen? Warum denkst du, hast du dieses Problem? Wie lange hast du das Problem schon?', 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-1' AND s.title = '1-Call-Close Skript' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, '4. Ist-Situation – Deine Fragen:', 'Was genau ist dein Angebot und was kostet es? Wie viel Umsatz machst du aktuell? Wer ist deine Zielgruppe? Wie gewinnst du aktuell deine Kunden?', 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-1' AND s.title = '1-Call-Close Skript' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, '5. Soll-Situation – Deine Fragen:', 'Was ist dein Ziel für die nächsten 6/12 Monate? Was würde sich positiv verändern, wenn du das Ziel erreichst? Warum ist dir das wichtig?', 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-1' AND s.title = '1-Call-Close Skript' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, '6. Distanz Soll/Ist schaffen – Notizen:', 'Beispiel: ''Ok, du stehst also bei 10k/Monat und möchtest auf 25k/Monat wachsen. Habe ich das richtig verstanden?''', 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-1' AND s.title = '1-Call-Close Skript' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, '7. Problem verstärken – Deine Fragen:', 'Was hält dich davon ab, es alleine zu schaffen? Was hast du bisher alles probiert? Wie lange probierst du schon? Beeinflusst das Problem auch andere Lebensbereiche?', 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-1' AND s.title = '1-Call-Close Skript' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, '8. Angebot präsentieren – Deine Formulierung:', 'Bleib vage. Fokus auf Ergebnis, Transformation, Vorteile – NICHT auf Prozesse oder Features. Warte dann auf die Fragen des Prospects.', 'textarea', NULL::jsonb, 8
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-1' AND s.title = '1-Call-Close Skript' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, '9. Preis nennen – Deine Formulierung:', 'Option 1: ''Das Investment beträgt [X Euro].'' Option 2 mit Preisanker: ''Normalerweise liegt das Investment bei [X Euro], aber...'' → Danach schweigen! Stille aushalten (1–2 Minuten normal).', 'textarea', NULL::jsonb, 9
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-1' AND s.title = '1-Call-Close Skript' AND s.order_index = 1;

-- Sections für Modul: Closing Skript 2-Call-Close
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Setting Call', 'Der erste Call – Qualifikation und Terminierung des Closing Calls.', 1
FROM onboarding_modules WHERE slug = 'closing-skript-2';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Setting Call – Deine Notizen und Anpassungen:', 'Ablauf: 1. Begrüßung 2. Agenda (''Heute geht es nur darum zu verstehen, ob es Sinn macht...'') 3. Expertenstatus 4. Ist-Situation 5. Soll-Situation 6. Zusammenfassung 7. Qualifikation (Entscheider, Geld, Startzeitpunkt) 8. Closing Call innerhalb 1–3 Tage terminieren.', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-2' AND s.title = 'Setting Call' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Qualifikation – Entscheider: Kannst du alleine entscheiden oder gibt es einen Mitentscheider?', 'Falls ja → muss diese Person beim Closing Call dabei sein.', 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-2' AND s.title = 'Setting Call' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Qualifikation – Budget: Welche grobe Preisspanne nennst du im Setting Call?', 'Konkrete Zahlen folgen im Closing Call, abhängig vom tatsächlichen Bedarf.', 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-2' AND s.title = 'Setting Call' AND s.order_index = 1;
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Closing Call', 'Der zweite Call – Pitch, Preis und Close.', 2
FROM onboarding_modules WHERE slug = 'closing-skript-2';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Dein Pitch – Positionierung (8.2):', 'Formel: ''Ich arbeite normalerweise mit [Zielgruppe] und helfe dabei, [Ziel X] zu erreichen ohne [Pain X]. In der Regel dauert das [X Tage].'' → Danach warten auf ''Erzähl mir mehr''.', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-2' AND s.title = 'Closing Call' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Deine Angebotsbeschreibung (8.3): Was du tust und wie es wirkt – vage, ohne das Problem zu lösen:', 'Wichtig: Bleib vage. Kein Preis. Fokus auf Ergebnis, Transformation, Vorteile. Unter 3–6 Minuten halten.', 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-2' AND s.title = 'Closing Call' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Die 3 Dinge für den Kundenerfolg (8.4):', 'Vorlage: 1. Ein gutes Angebot 2. Menschen die dieses Angebot kaufen möchten 3. Einen Prozess, um diese Menschen zu erreichen – individuell ausarbeiten.', 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-2' AND s.title = 'Closing Call' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Fokus auf Transformation (8.5) – Deine Version:', 'Beispiel: ''Du bist auf Social Media aktiv... Dein größter Knackpunkt ist aktuell dein Angebot. Wenn wir dein Angebot gemeinsam überarbeiten, wirst du mehr Sales Calls buchen...''', 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-2' AND s.title = 'Closing Call' AND s.order_index = 2;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Preis nennen + Stille halten – Deine Formulierung:', 'Option 1: ''Das Investment beträgt X Euro.'' Option 2 mit Preisanker: ''Normalerweise liegt die Betreuung bei 6000 Euro. Ich habe jedoch festgestellt... Deshalb hast du die Möglichkeit, für 4500 Euro zu starten, wenn du die Entscheidung jetzt hier mit mir triffst.'' → Stille! 1–2 Minuten aushalten.', 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'closing-skript-2' AND s.title = 'Closing Call' AND s.order_index = 2;

-- Sections für Modul: Einwandbehandlung
INSERT INTO onboarding_sections (module_id, title, description, order_index)
SELECT id, 'Einwand-Bibliothek', 'Deine Antworten auf die häufigsten Einwände – lies durch und passe auf deine Stimme an.', 1
FROM onboarding_modules WHERE slug = 'einwandbehandlung';
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Einwand: ''Ich habe kein Geld / Das ist zu teuer'' – Deine angepasste Antwort:', 'Vorlage: ''Lass uns gleich gerne über deine finanzielle Situation reden, aber gibt es denn irgendwas, was dir inhaltlich nicht passt?'' → Von ''zu teuer'' über ''teuer'' über ''hochpreisig'' zu ''wertvoll''.', 'textarea', NULL::jsonb, 1
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'einwandbehandlung' AND s.title = 'Einwand-Bibliothek' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Einwand: ''Ich brauche Bedenkzeit'' – Deine angepasste Antwort:', 'Reality-Check: Horror-Szenario / Reality-Check / Bedarf / Vertrauen / Budget. Oder Deep Dive: ''Welche Themen haben wir noch nicht geklärt, über die du nachdenken möchtest?''', 'textarea', NULL::jsonb, 2
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'einwandbehandlung' AND s.title = 'Einwand-Bibliothek' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Einwand: ''Der Zeitpunkt passt gerade nicht'' – Deine angepasste Antwort:', 'Fragen: ''Wann wird denn ein guter Zeitpunkt sein?'' / ''Was wäre denn, wenn es noch viel schlimmer wird?'' / ''Warum hast du dich ursprünglich auf das Gespräch eingelassen?''', 'textarea', NULL::jsonb, 3
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'einwandbehandlung' AND s.title = 'Einwand-Bibliothek' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Einwand: ''Ich muss meinen Partner fragen'' – Deine angepasste Antwort:', 'Frage: ''Du willst nur ein kurzes Go bekommen und dann starten wir durch? Oder gibt es noch etwas anderes?'' Bei Ja: Termin für gemeinsamen Call.', 'textarea', NULL::jsonb, 4
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'einwandbehandlung' AND s.title = 'Einwand-Bibliothek' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Einwand: ''Ich melde mich nächste Woche'' – Deine angepasste Antwort:', 'Ehrlich: ''Meiner Erfahrung nach meldet sich dann nie jemand zurück.'' / ''Wer ist dein Vorbild? Wie würde er jetzt handeln?''', 'textarea', NULL::jsonb, 5
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'einwandbehandlung' AND s.title = 'Einwand-Bibliothek' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Einwand: ''Ich brauche eine Garantie'' – Deine angepasste Antwort:', 'Vorlage: ''Ich garantiere dir, wenn du so weitermachst wie bisher, wird sich nichts verändern. Aber wir garantieren dir auch, dass unser System funktioniert [Garantie nennen].''', 'textarea', NULL::jsonb, 6
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'einwandbehandlung' AND s.title = 'Einwand-Bibliothek' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Einwand: ''Ich hab schonmal ein Coaching gekauft und es hat nicht funktioniert'' – Deine Antwort:', 'Frage: ''Wem vertraust du gerade nicht? Mir oder dir?'' / ''Welches Ergebnis unserer Zusammenarbeit würde das Investment zu einem No-Brainer machen?''', 'textarea', NULL::jsonb, 7
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'einwandbehandlung' AND s.title = 'Einwand-Bibliothek' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Einwand: ''Sobald ich den ersten Kunden gewinne, starten wir'' – Deine Antwort:', 'Reality-Check: ''Du möchtest jetzt so weitermachen wie bisher – was nicht funktioniert. Und durch einen komischen Zufall wird es so gut funktionieren, dass du auf einmal Geld zur Seite legen kannst?''', 'textarea', NULL::jsonb, 8
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'einwandbehandlung' AND s.title = 'Einwand-Bibliothek' AND s.order_index = 1;
INSERT INTO onboarding_questions (section_id, module_id, question_text, helper_text, type, options, order_index)
SELECT s.id, m.id, 'Einwand: ''Ich brauche das nicht'' – Deine Antwort:', 'Frage: ''Was passiert, wenn wir das Thema nicht zusammen angehen?'' / ''Wenn du das nicht brauchst und das alleine besser kannst – warum sprechen wir dann heute miteinander?''', 'textarea', NULL::jsonb, 9
FROM onboarding_sections s
JOIN onboarding_modules m ON m.id = s.module_id
WHERE m.slug = 'einwandbehandlung' AND s.title = 'Einwand-Bibliothek' AND s.order_index = 1;

