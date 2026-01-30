# Deployment ohne Docker (Node.js + PM2 + Nginx)

Da die Datenbank nun in der Cloud (Supabase) liegt, ist Docker nicht mehr zwingend notwendig. Die App kann performant direkt auf dem VPS laufen.

## Voraussetzungen auf dem VPS

```bash
# Node.js 20 installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# PM2 (Process Manager) installieren
sudo npm install -g pm2
```

## 1. Code aktualisieren und installieren

```bash
cd ~/Haushaltsplan-main
git pull

# Backend installieren
cd backend
npm install

# Frontend installieren & bauen
cd ../frontend
npm install
# WICHTIG: Erstelle die .env Datei für den Build
cp .env.example .env
nano .env 
# -> Fülle hier VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY ein!
# -> Setze VITE_API_URL=/api

# Build durchführen (jetzt werden die Variablen fest "eingebacken")
npm run build
```

## 2. Backend mit PM2 starten

```bash
cd ~/Haushaltsplan-main/backend

# .env für Backend erstellen
cp .env.example .env
nano .env
# -> Fülle SUPABASE_URL und SUPABASE_ANON_KEY ein

# Server starten
pm2 start server.js --name "haushaltsplan-api"
pm2 save
pm2 startup
```

## 3. Nginx konfigurieren (Reverse Proxy)

Erstelle eine Config für die Seite:
`sudo nano /etc/nginx/sites-available/haushaltsplan`

```nginx
server {
    listen 80;
    server_name DEINE_DOMAIN_ODER_IP;

    root /home/kris/Haushaltsplan-main/frontend/dist;
    index index.html;

    # Frontend (Single Page App)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktivieren und Neustart:
```bash
sudo ln -s /etc/nginx/sites-available/haushaltsplan /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Falls Standard-Seite noch aktiv
sudo nginx -t
sudo systemctl restart nginx
```

## Checkliste bei Problemen

- [ ] Läuft Backend? `pm2 status`
- [ ] Backend Logs? `pm2 logs haushaltsplan-api`
- [ ] Ist Port 3001 belegt? `sudo lsof -i :3001`
- [ ] Nginx Fehler? `sudo tail -f /var/log/nginx/error.log`
