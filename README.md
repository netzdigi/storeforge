# Storeforge

Storeforge ist die Grundlage für eine SaaS-Plattform, auf der sich Nutzer
registrieren und ihren eigenen Online-Shop erstellen können — eine
Kombination aus Shopify (Produkte verkaufen) und einem einfachen
Website-Baukasten.

## Aktueller Stand (MVP-Fundament)

- Registrierung & Login (E-Mail/Passwort, sitzungsbasiert per JWT-Cookie)
- Jeder Nutzer kann beliebig viele Shops anlegen (Name + eindeutige URL-Kennung)
- Produkte pro Shop verwalten (anlegen, auflisten, löschen)
- Seiten-Editor: Shop-Startseite aus Blöcken (Überschrift, Text, Bild, Produktübersicht)
  zusammensetzen, per ↑/↓ neu anordnen, bearbeiten und löschen
- Öffentliche Storefront unter `/s/<slug>` für jeden Shop
- Geschütztes Dashboard unter `/dashboard`

## Noch nicht enthalten (nächste Schritte)

- Echtes Drag-&-Drop im Seiteneditor (aktuell ↑/↓-Buttons) / Themes
- Bestellungen & Warenkorb, Zahlungsabwicklung (z. B. Stripe)
- Eigene Domains / Subdomains pro Shop
- Bildupload (aktuell nur Bild-URL)
- E-Mail-Verifizierung & Passwort-Reset
- Team-/Mehrbenutzerzugriff pro Shop

## Setup

1. `.env.local` aus `.env.example` erstellen und ausfüllen:
   - `DATABASE_URL` – Postgres-Connection-String (z. B. von [Neon](https://neon.tech))
   - `JWT_SECRET` – langer, zufälliger String
2. Datenbankschema anlegen: Inhalt von `schema.sql` gegen die Datenbank ausführen.
3. Abhängigkeiten installieren: `npm install`
4. Dev-Server starten: `npm run dev`

## Tech-Stack

- Next.js 15 (App Router)
- PostgreSQL via `@neondatabase/serverless`
- Auth: `bcryptjs` (Passwort-Hashing) + `jose` (JWT-Sessions)
