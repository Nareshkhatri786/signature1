# 🚀 VPS Deployment Guide - GitHub Repository

Complete guide to deploy your Signature Properties CRM from GitHub to your VPS.

## Prerequisites
- ✅ VPS with Ubuntu 20.04+ (2GB RAM, 10GB disk)
- ✅ SSH access to your VPS
- ✅ Your GitHub repository URL

---

## 🎯 One-Command Installation

### Method 1: Automated Script (Recommended)
```bash
# SSH into your VPS and run:
curl -fsSL https://raw.githubusercontent.com/your-username/signature-crm/main/deploy/automated-deploy.sh | sudo bash
```

### Method 2: Manual Quick Install
```bash
# 1. SSH into your VPS
ssh root@your-vps-ip

# 2. Install Docker (if not installed)
curl -fsSL https://get.docker.com | sh
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 3. Clone your repository
git clone https://github.com/your-username/signature-crm.git /opt/signature-crm
cd /opt/signature-crm

# 4. Run installer
chmod +x install.sh
./install.sh
```

---

## 📱 For aaPanel Users

### Step 1: Prepare aaPanel
1. **Login to aaPanel**: `http://your-vps-ip:7800`
2. **Install Docker Manager** (if not installed):
   - Go to **App Store** → Search "Docker" → Install

### Step 2: Deploy via aaPanel Terminal
1. **Open Terminal** in aaPanel
2. **Run deployment**:
```bash
cd /opt
git clone https://github.com/your-username/signature-crm.git
cd signature-crm
chmod +x install.sh
./install.sh
```

### Step 3: Configure Website (Optional)
1. **Website** → **Add Site**
2. **Domain**: Your domain or IP
3. **Root Directory**: `/opt/signature-crm`
4. **Reverse Proxy**: 
   - **Target URL**: `http://127.0.0.1:80`
   - **Enable**: Yes

---

## 🔧 Manual Configuration

### Step 1: Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Update these key values:**
```env
# Replace with your domain or VPS IP
CORS_ORIGIN=http://your-domain-or-ip
REACT_APP_API_URL=http://your-domain-or-ip/api

# Generate secure passwords
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_long_jwt_secret_64_characters_minimum
```

### Step 2: Deploy Services
```bash
# Create directories
mkdir -p logs uploads backups ssl

# Start all services
docker-compose up -d --build

# Wait for startup (2-3 minutes)
sleep 120

# Check status
docker-compose ps
```

---

## 🌐 Access Your CRM

**URL**: `http://your-vps-ip` or `http://your-domain.com`

**Login Credentials**:
- **Quick**: `admin` / `admin`
- **Email**: `admin@signatureproperties.com` / `admin123`
- **Manager**: `manager@signatureproperties.com` / `manager123`
- **Sales**: `sales@signatureproperties.com` / `sales123`

---

## 🛠️ Management Commands

```bash
# Navigate to CRM directory
cd /opt/signature-crm

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Start services
docker-compose up -d

# Update from repository
git pull origin main
docker-compose up -d --build

# Create backup
./backup.sh

# Check system status
./status.sh  # (if created by installer)
```

---

## 🔒 SSL Setup (Optional)

### For Domain Users
```bash
# Install certbot
apt install -y certbot

# Stop nginx temporarily
docker-compose stop nginx

# Get SSL certificate
certbot certonly --standalone -d yourdomain.com

# Copy certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem

# Enable HTTPS in nginx.conf (uncomment HTTPS section)
nano nginx.conf

# Restart nginx
docker-compose start nginx
```

---

## 🐛 Troubleshooting

### Services Not Starting
```bash
# Check Docker
systemctl status docker
systemctl restart docker

# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Port Conflicts
```bash
# Check what's using port 80
netstat -tulpn | grep :80

# Stop conflicting services
systemctl stop apache2  # or nginx
systemctl disable apache2

# Restart CRM
docker-compose up -d
```

### Database Issues
```bash
# Check database
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Reset database (WARNING: deletes all data)
docker-compose down
docker volume rm signature-crm_postgres_data
docker-compose up -d
```

### Permission Issues
```bash
# Fix permissions
chown -R root:root /opt/signature-crm
chmod -R 755 /opt/signature-crm
chmod +x *.sh
```

---

## 📊 Health Check

```bash
# Quick status check
cd /opt/signature-crm

echo "=== Docker Services ==="
docker-compose ps

echo "=== API Health ==="
curl -s http://localhost/api/health

echo "=== System Resources ==="
free -h
df -h

echo "=== Access URL ==="
echo "http://$(curl -s ifconfig.me)"
```

---

## 🔄 Updates

### Update from Repository
```bash
cd /opt/signature-crm

# Pull latest changes
git pull origin main

# Restart with new code
docker-compose down
docker-compose up -d --build
```

### Update Docker Images
```bash
cd /opt/signature-crm

# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d
```

---

## 📞 Support

### Common Issues
1. **Can't access CRM**: Check firewall (ports 80, 443)
2. **Login not working**: Check backend logs
3. **Database errors**: Restart database container
4. **Out of disk space**: Clean Docker images

### Get Help
```bash
# Comprehensive system check
cd /opt/signature-crm
docker-compose ps
docker-compose logs --tail=50
free -h && df -h
curl -I http://localhost
```

### Useful Commands
```bash
# Clean Docker system
docker system prune -af

# View resource usage
htop  # or top

# Check disk usage
du -sh /opt/signature-crm/*

# View recent logs
tail -f /opt/signature-crm/logs/*.log
```

---

## 🎉 Success!

Your Signature Properties CRM is now running on your VPS!

**What's Next?**
1. ✅ Login and explore the dashboard
2. ✅ Go to Settings → Configure email & WhatsApp
3. ✅ Add your real estate projects
4. ✅ Start managing leads and opportunities
5. ✅ Set up automated backups
6. ✅ Configure your domain and SSL

**Need help?** Check the logs or restart services. Your CRM includes everything you need for real estate sales management! 🏢✨