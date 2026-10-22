# Bhowanee — Hostinger Production Deployment Guide

This guide details step-by-step instructions for deploying the **Bhowanee** platform (NestJS + PostgreSQL with PostGIS + Socket.IO + Static HTML/CSS/JS frontend) on **Hostinger VPS** (Ubuntu 22.04 / 24.04 LTS).

---

## ⚡ Quick 1-Command Full-Stack Docker Deployment (Recommended)

Everything has been containerized. You can run the entire platform (Database + Backend + Frontend + Reverse Proxy) with a single command:

```bash
# 1. SSH into Hostinger VPS
ssh root@<YOUR_HOSTINGER_VPS_IP>

# 2. Install Docker & Compose (if not already installed)
curl -fsSL https://get.docker.com | sh

# 3. Clone repository
git clone <YOUR_GIT_REPOSITORY_URL> /var/www/bhowanee
cd /var/www/bhowanee

# 4. Launch entire stack in Docker
docker compose up --build -d
```

The stack automatically:
- Boots **PostgreSQL 16 + PostGIS** container with persistent volume
- Builds the **NestJS Backend**, runs Prisma migrations, applies database seeds, and starts on port 3000
- Boots **Nginx**, serving all frontend dashboards on **Port 80** and reverse-proxying `/api/` and `/socket.io/`

---

## Architecture Overview

```
                                      Internet
                                         │
                                         ▼
                     ┌──────────────────────────────────────┐
                     │          Nginx Container             │
                     │          (Port 80 / 8080)            │
                     └──────────────────┬───────────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     Static Web Root             │           │        NestJS Backend           │
│  index.html, farmer.html, etc.  │           │      (Container : 3000)         │
│  (Mounted into /usr/share/...)  │           │      REST API + Socket.IO       │
└─────────────────────────────────┘           └────────────────┬────────────────┘
                                                               │
                                                               ▼
                                              ┌─────────────────────────────────┐
                                              │      PostgreSQL + PostGIS       │
                                              │      (Container : 5432)         │
                                              └─────────────────────────────────┘
```

---

## 1. Hostinger VPS Initial Setup (Step-by-Step)

### 1.1 Connect via SSH
```bash
ssh root@<YOUR_HOSTINGER_VPS_IP>
```

### 1.2 Update System Packages
```bash
apt update && apt upgrade -y
apt install -y git curl wget ufw htop
```

### 1.3 Install Docker & Docker Compose
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER
systemctl enable docker && systemctl start docker
```

---

## 2. Clone & Prepare Bhowanee Repository

```bash
mkdir -p /var/www/bhowanee
cd /var/www/bhowanee
git clone <YOUR_GIT_REPOSITORY_URL> .
```

---

## 3. Database Deployment (PostgreSQL + PostGIS via Docker)

In `/var/www/bhowanee/backend`:

```bash
cd /var/www/bhowanee/backend
cp .env.example .env
```

Edit `.env` with your secure production secrets:
```ini
NODE_ENV=production
PORT=3000

# Set strong password
DATABASE_URL="postgresql://bhowanee_prod:YOUR_STRONG_PASSWORD@localhost:5432/bhowanee_prod?schema=public"

JWT_ACCESS_SECRET="GENERATE_A_64_CHAR_HEX_SECRET"
JWT_REFRESH_SECRET="GENERATE_ANOTHER_64_CHAR_HEX_SECRET"

CORS_ORIGIN="https://yourdomain.com"
```

Start the PostGIS container:
```bash
docker compose up -d
```

Verify PostGIS container status:
```bash
docker ps
```

---

## 4. Backend Build & Database Migration

```bash
cd /var/www/bhowanee/backend
npm install --production=false
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed   # Seed initial districts, blocks, test accounts
npm run build
```

### 4.1 Run with PM2
```bash
pm2 start dist/main.js --name "bhowanee-backend"
pm2 save
pm2 startup
```

Verify backend health:
```bash
curl http://localhost:3000/api/health
```
Expected response: `{"status":"ok","timestamp":"..."}`

---

## 5. Frontend Configuration

Set the production backend URL for the frontend in `api-client.js` or via a global config snippet before `api-client.js` in HTML pages:

```html
<script>
  window.BHOWANEE_API_BASE = 'https://yourdomain.com/api';
  window.BHOWANEE_WS_URL   = 'https://yourdomain.com';
</script>
```

---

## 6. Nginx Reverse Proxy Configuration

Create `/etc/nginx/sites-available/bhowanee`:

```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    # Static Frontend
    root /var/www/bhowanee;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Proxy for Socket.IO
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Enable site and test:
```bash
ln -s /etc/nginx/sites-available/bhowanee /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 7. SSL Certificate Setup (Let's Encrypt Certbot)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically configure SSL certificate renewal.

---

## 8. Firewall Configuration (UFW)

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## 9. Verification Checklist

1. [x] Visit `https://yourdomain.com` — Landing page and login modal load smoothly.
2. [x] Log in as Farmer (`9876543210` / OTP) — Navigates to `farmer.html`.
3. [x] Open `buyer.html` in a second tab / device — Browse lots.
4. [x] Place a bid in `buyer.html` — Live Socket.IO event immediately updates Farmer's SVG bid board and Block Admin's live board without page reload.
5. [x] Set Farmer asking price in `farmer.html` — Buyer and Block screens show the ask line updated live.
6. [x] Bid meeting ask price triggers auto-close and creates pending payment record.
