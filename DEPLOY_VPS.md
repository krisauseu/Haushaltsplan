# VPS Deployment Anleitung

## ⚠️ WICHTIG: Die häufigsten Fehler

### Weißer Screen / "Supabase Key nicht gefunden"
**Ursache:** Vite erkennt nur Umgebungsvariablen mit `VITE_` Prefix!

Die `.env` im Projekt-Root muss BEIDE Varianten enthalten:
- `SUPABASE_URL` und `SUPABASE_ANON_KEY` → für das Backend
- `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` → für das Frontend

---

## Option A: Mit Docker (empfohlen)

### 1. Projekt auf VPS klonen
```bash
cd ~
git clone https://github.com/krisauseu/Haushaltsplan.git
cd Haushaltsplan
```

### 2. .env Datei erstellen
```bash
nano .env
```

Füge folgendes ein (mit deinen echten Keys):
```
# Backend Variablen
SUPABASE_URL=https://DEIN_PROJEKT.supabase.co
SUPABASE_ANON_KEY=dein-anon-key-hier

# Frontend Variablen (WICHTIG: VITE_ Prefix!)
VITE_SUPABASE_URL=https://DEIN_PROJEKT.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key-hier
VITE_API_URL=/api
```

### 3. Docker Container starten
```bash
# Alte Container stoppen und entfernen
docker-compose down --rmi all

# Neu bauen und starten
docker-compose up -d --build

# Logs prüfen
docker-compose logs -f
```

### 4. Prüfen
- Frontend: `http://DEINE_IP:3000`
- Backend Health: `http://DEINE_IP:3001/api/health`

---

## Option B: Ohne Docker (Node.js + PM2 + Nginx)

### Voraussetzungen installieren
```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# PM2
sudo npm install -g pm2
```

### 1. Code holen
```bash
cd ~
git clone https://github.com/krisauseu/Haushaltsplan.git
cd Haushaltsplan
```

### 2. Backend einrichten
```bash
cd ~/Haushaltsplan/backend

# .env erstellen
cat > .env << 'EOF'
SUPABASE_URL=https://DEIN_PROJEKT.supabase.co
SUPABASE_ANON_KEY=dein-anon-key-hier
PORT=3001
EOF

npm install
pm2 start server.js --name "haushaltsplan-api"
pm2 save
```

### 3. Frontend bauen
```bash
cd ~/Haushaltsplan/frontend

# WICHTIG: .env VOR dem Build erstellen!
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://DEIN_PROJEKT.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key-hier
VITE_API_URL=/api
EOF

npm install
npm run build
```

### 4. Nginx konfigurieren
```bash
sudo nano /etc/nginx/sites-available/haushaltsplan
```

Füge ein:
```nginx
server {
    listen 80;
    server_name _;

    root /home/DEIN_USER/Haushaltsplan/frontend/dist;
    index index.html;

    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
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

Aktivieren:
```bash
sudo ln -sf /etc/nginx/sites-available/haushaltsplan /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

---

## Troubleshooting Checkliste

### Weißer Screen im Browser
- [ ] Browser-Konsole öffnen (F12) - welche Fehler?
- [ ] Wurden VITE_ Variablen VOR dem Build gesetzt?
- [ ] Mit Docker: `docker-compose logs frontend` prüfen

### API-Fehler
- [ ] Backend läuft? `pm2 status` oder `docker ps`
- [ ] Logs prüfen: `pm2 logs` oder `docker-compose logs backend`
- [ ] Port 3001 erreichbar? `curl localhost:3001/api/health`

### Supabase-Fehler
- [ ] Keys korrekt kopiert (keine Leerzeichen am Ende)?
- [ ] Supabase-Projekt aktiv (nicht pausiert)?
- [ ] Im Supabase Dashboard → Settings → API prüfen

### Docker spezifisch
```bash
# Alles stoppen und neu bauen
docker-compose down --rmi all -v
docker-compose up -d --build

# Live-Logs
docker-compose logs -f
```

---

## Quick-Fix: .env Variablen prüfen

Nach dem Build kannst du prüfen, ob die Variablen eingebettet wurden:
```bash
# Im dist-Ordner nach dem Supabase-URL suchen
grep -r "supabase.co" frontend/dist/
```

Wenn deine URL nicht gefunden wird, wurden die Variablen nicht korrekt gesetzt!
