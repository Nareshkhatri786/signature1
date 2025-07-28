# ⚡ Quick Start Guide - 5 Minutes Setup

Ultra-fast installation for experienced users.

## 🚀 One-Command Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/signature-crm.git /opt/signature-crm
cd /opt/signature-crm

# 2. Quick setup
cp .env.example .env
chmod +x *.sh

# 3. Install and run (automated)
./install.sh
```

## 🔧 Manual Quick Setup

```bash
# Prerequisites (Ubuntu/Debian)
apt update && apt install -y docker.io docker-compose git

# Clone and setup
git clone https://github.com/your-username/signature-crm.git /opt/signature-crm
cd /opt/signature-crm

# Environment (minimal config)
cat > .env << EOF
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
DB_HOST=postgres
NODE_ENV=production
CORS_ORIGIN=http://$(curl -s ifconfig.me)
REACT_APP_API_URL=http://$(curl -s ifconfig.me)/api
EOF

# Deploy
docker-compose up -d --build

# Wait and check
sleep 120
docker-compose ps
```

## 📱 Access

**URL**: `http://your-server-ip`

**Login**: `admin` / `admin`

## 🔥 Common Commands

```bash
cd /opt/signature-crm

# Start/Stop
docker-compose up -d
docker-compose down

# Logs
docker-compose logs -f

# Update
git pull && docker-compose up -d --build

# Backup
./backup.sh

# Status
docker-compose ps && curl -s http://localhost/api/health
```

## 🚨 Troubleshooting

```bash
# Fix most issues
systemctl restart docker
cd /opt/signature-crm
docker-compose down
docker-compose up -d --build

# Check ports
netstat -tulpn | grep :80

# Check resources
df -h && free -h
```

That's it! Your CRM is ready in under 5 minutes! 🎉

For detailed setup, see [INSTALLATION.md](./INSTALLATION.md)