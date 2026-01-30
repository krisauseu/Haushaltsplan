# Haushaltsplan - Budget Planner

Eine moderne Full-Stack Web-Anwendung zur Verwaltung von Haushaltsbudgets mit Supabase Backend.

## Features

- 📊 **Übersichtliche Tabelle** mit allen 12 Monaten + Jahressumme
- ✏️ **Edit-Mode** zum schnellen Ändern von Beträgen
- 🎨 **Farbkodierung** - Grün für positive, Rot für negative Salden
- ☁️ **Supabase** Cloud-Datenbank für sichere Speicherung
- 🐳 **Docker-ready** für einfaches Deployment
- 📱 **Responsive Design** für Desktop und Tablet

## Tech Stack

| Layer | Technologie |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend | Node.js 20, Express.js |
| Datenbank | Supabase (PostgreSQL) |
| Deployment | Docker, docker-compose |

## Schnellstart

### 1. Repository klonen

```bash
git clone https://github.com/krisauseu/Haushaltsplan.git
cd Haushaltsplan
```

### 2. Supabase einrichten

1. Erstelle ein Projekt auf [supabase.com](https://supabase.com)
2. Führe das SQL-Schema aus `backend/db/init.sql` im Supabase SQL-Editor aus
3. Kopiere deine Supabase-Credentials

### 3. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
```

Inhalt der `.env`:
```env
SUPABASE_URL=https://dein-projekt.supabase.co
SUPABASE_ANON_KEY=dein_anon_key
```

### 4. Container starten

```bash
# Alle Container bauen und starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f
```

### 5. App öffnen

- **Lokal:** http://localhost:3000
- **Server:** http://[SERVER-IP]:3000

## Ports

| Service | Port | Beschreibung |
|---------|------|--------------|
| Frontend | 3000 | Nginx Web-Server |
| Backend | 3001 | REST API |

## API Endpoints

| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/api/health` | Health Check |
| GET | `/api/categories` | Alle Kategorien |
| POST | `/api/categories` | Neue Kategorie |
| PUT | `/api/categories/:id` | Kategorie bearbeiten |
| DELETE | `/api/categories/:id` | Kategorie löschen |
| GET | `/api/values/:year` | Monatswerte für Jahr |
| PUT | `/api/values` | Einzelwert speichern |
| PUT | `/api/values/batch` | Mehrere Werte speichern |
| GET | `/api/summary/:year` | Jahresübersicht |

## Entwicklung

### Lokale Entwicklung ohne Docker

```bash
# Backend starten
cd backend
npm install
npm run dev

# Frontend starten (neues Terminal)
cd frontend
npm install
npm run dev
```

### Container neu bauen

```bash
docker-compose build --no-cache
docker-compose up -d
```

## Lizenz

MIT License
