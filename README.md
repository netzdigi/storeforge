# Storeforge

Storeforge ist die Grundlage für eine SaaS-Plattform, auf der sich Nutzer
registrieren und ihren eigenen Online-Shop erstellen können — eine
Kombination aus Shopify (Produkte verkaufen) und einem einfachen
Website-Baukasten.

## Aktueller Stand (MVP-Fundament)

- Registrierung & Login (E-Mail/Passwort, sitzungsbasiert per JWT-Cookie)
- Jeder Nutzer kann beliebig viele Projekte anlegen, je Projekt entweder
  als **Online-Shop** (mit Produktverwaltung) oder als reine **Webseite**
- Mehrseitig: jedes Projekt hat eine Startseite plus beliebig viele
  Unterseiten (eigene URL, eigene Blöcke), mit automatischer Navigation
  auf der Storefront sobald mehr als eine Seite existiert
- Shopify-artiger Seiten-Editor (Werkzeugleiste, Block-Liste, Live-Vorschau
  mit Desktop/Mobile-Umschalter, Eigenschaften-Panel) mit 18 Blocktypen:
  Überschrift, Text, Bild, Hero-Bereich, Button/CTA, Bildergalerie,
  Feature-Grid, Countdown-Timer, Kennzahlen-Leiste, Preistabelle,
  Vorher-Nachher-Slider, Sticky-CTA-Leiste, Testimonials, FAQ,
  Social-Media-Links, Kontaktformular, Newsletter-Anmeldung,
  Produktübersicht (nur für Shops)
- Kontaktformular- und Newsletter-Block sind echt: Einsendungen landen in
  der Datenbank und erscheinen im „Posteingang" auf der Projektseite im
  Dashboard
- KI-Assistent im Seiteneditor (Claude API): "✨ Verbessern" an Text-,
  Überschrift-, Zitat- und FAQ-Antwort-Feldern, sowie "✨ Mit KI erstellen"
  beim Hinzufügen eines Blocks (Prompt → passender Blocktyp + Inhalt werden
  vorausgefüllt, vor dem Speichern noch bearbeitbar). Braucht `ANTHROPIC_API_KEY`.
- Produkte pro Shop verwalten (anlegen, auflisten, löschen)
- Öffentliche Storefront unter `/s/<slug>` (und `/s/<slug>/<seite>` für
  Unterseiten) für jedes Projekt
- Geschütztes Dashboard unter `/dashboard`

## Noch nicht enthalten (nächste Schritte)

- KI-Bildgenerierung (Anbieter noch offen)
- Echtes Drag-&-Drop im Seiteneditor (aktuell ↑/↓-Buttons) / Themes
- Bestellungen & Warenkorb, Zahlungsabwicklung (z. B. Stripe)
- Eigene Domains / Subdomains pro Projekt
- Bildupload (aktuell nur Bild-URL)
- E-Mail-Verifizierung & Passwort-Reset
- Team-/Mehrbenutzerzugriff pro Projekt

## Setup

1. `.env.local` aus `.env.example` erstellen und ausfüllen:
   - `DATABASE_URL` – Postgres-Connection-String (z. B. von [Neon](https://neon.tech))
   - `JWT_SECRET` – langer, zufälliger String
   - `ANTHROPIC_API_KEY` – für den KI-Assistenten im Seiteneditor (optional;
     ohne den Key zeigen die "✨"-Buttons nur eine Fehlermeldung)
2. Datenbankschema anlegen: Inhalt von `schema.sql` gegen die Datenbank ausführen.
   Bei einer bereits bestehenden Datenbank die Dateien in `migrations/`
   der Reihe nach ausführen (0001 für Single-Page → Mehrseiten-Umstellung,
   0002 für Kontaktformular/Newsletter-Speicherung).
3. Abhängigkeiten installieren: `npm install`
4. Dev-Server starten: `npm run dev`

## Tech-Stack

- Next.js 15 (App Router)
- PostgreSQL via `@neondatabase/serverless`
- Auth: `bcryptjs` (Passwort-Hashing) + `jose` (JWT-Sessions)
