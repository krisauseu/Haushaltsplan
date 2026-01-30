# Haushaltsplan - Budget Planner

Eine moderne Full-Stack Web-Anwendung zur Verwaltung von Haushaltsbudgets, optimiert für Self-Hosting auf Unraid.

![Budget Table](https://via.placeholder.com/800x400?text=Haushaltsplan+Dashboard)

## Features

- 📊 **Übersichtliche Tabelle** mit allen 12 Monaten + Jahressumme
- ✏️ **Edit-Mode** zum schnellen Ändern von Beträgen
- 🎨 **Farbkodierung** - Grün für positive, Rot für negative Salden
- 💾 **PostgreSQL** Datenbank für permanente Speicherung
- 🐳 **Docker-ready** für einfaches Deployment
- 📱 **Responsive Design** für Desktop und Tablet

## Tech Stack

| Layer | Technologie |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend | Node.js 20, Express.js |
| Datenbank | PostgreSQL 16 |
| Deployment | Docker, docker-compose |

## Schnellstart

### 1. Repository klonen / Dateien kopieren

```bash
# Auf Unraid: Kopiere den Ordner nach /mnt/user/appdata/haushaltsplan
cd /mnt/user/appdata/haushaltsplan
```

### 2. Umgebungsvariablen konfigurieren

```bash
# .env Datei erstellen
cp .env.example .env

# Passwort ändern (WICHTIG!)
nano .env
```

Inhalt der `.env`:
```env
DB_USER=haushaltsplan
DB_PASSWORD=dein_sicheres_passwort_hier
```

### 3. Container starten

```bash
# Alle Container bauen und starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f
```

### 4. App öffnen

- **Lokal:** http://localhost:3000
- **Unraid:** http://[UNRAID-IP]:3000
- **Tailscale:** http://[TAILSCALE-IP]:3000

## Ports

| Service | Port | Beschreibung |
|---------|------|--------------|
| Frontend | 3000 | Nginx Web-Server |
| Backend | 3001 | REST API |
| PostgreSQL | 5432 | Nur intern (nicht exposed) |

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
| GET | `/api/summary/:year` | Jahresübersicht |

## Datensicherung

Die PostgreSQL-Daten werden in einem Docker Volume gespeichert:
- Volume-Name: `haushaltsplan-postgres-data`

### Backup erstellen
```bash
docker exec haushaltsplan-db pg_dump -U haushaltsplan haushaltsplan > backup.sql
```

### Backup wiederherstellen
```bash
cat backup.sql | docker exec -i haushaltsplan-db psql -U haushaltsplan haushaltsplan
```

## Entwicklung

### Lokale Entwicklung ohne Docker

```bash
# Backend starten
cd backend
npm install
DATABASE_URL=postgresql://user:pass@localhost:5432/haushaltsplan npm run dev

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
