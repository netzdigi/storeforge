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
  mit Desktop/Mobile-Umschalter, Eigenschaften-Panel) mit 8 Blocktypen:
  Überschrift, Text, Bild, Hero-Bereich, Button/CTA, Bildergalerie,
  Feature-Grid, Produktübersicht (nur für Shops)
- Produkte pro Shop verwalten (anlegen, auflisten, löschen)
- Öffentliche Storefront unter `/s/<slug>` (und `/s/<slug>/<seite>` für
  Unterseiten) für jedes Projekt
- Geschütztes Dashboard unter `/dashboard`

## Noch nicht enthalten (nächste Schritte)

- Weitere Blocktypen (Testimonials, FAQ, Kontaktformular, Newsletter, Social Links …)
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
2. Datenbankschema anlegen: Inhalt von `schema.sql` gegen die Datenbank ausführen.
   Bei einer bereits bestehenden Datenbank mit dem alten (Single-Page-)Schema
   stattdessen `migrations/0001_pages_and_project_type.sql` ausführen.
3. Abhängigkeiten installieren: `npm install`
4. Dev-Server starten: `npm run dev`

## Tech-Stack

- Next.js 15 (App Router)
- PostgreSQL via `@neondatabase/serverless`
- Auth: `bcryptjs` (Passwort-Hashing) + `jose` (JWT-Sessions)
