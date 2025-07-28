# 🚀 Signature Properties CRM - VPS Installation Guide

Complete step-by-step guide to install the CRM system on your VPS using Docker and aaPanel.

## 📋 Prerequisites

### System Requirements
- **VPS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 10GB available space
- **Control Panel**: aaPanel (optional but recommended)
- **Ports**: 80, 443, 3001, 5432 (will be configured automatically)

### Required Software
- Git
- Docker & Docker Compose
- Basic shell access (SSH)

---

## 🔧 Step 1: Prepare Your VPS

### 1.1 Connect to Your VPS
```bash
# Connect via SSH (replace with your VPS IP)
ssh root@your-vps-ip
```

### 1.2 Update System
```bash
# Update package lists
apt update && apt upgrade -y

# Install essential tools
apt install -y git curl wget unzip
```

### 1.3 Install Docker (if not already installed)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

---

## 📦 Step 2: Clone and Setup Repository

### 2.1 Clone Your Repository
```bash
# Navigate to installation directory
cd /opt

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/your-username/signature-crm.git

# Enter project directory
cd signature-crm

# Make scripts executable
chmod +x *.sh
chmod +x deploy/*.sh
```

### 2.2 Create Environment File
```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Configure your .env file:**
```env
# Database Configuration
DB_PASSWORD=your_secure_database_password_here
DB_HOST=postgres
DB_PORT=5432
DB_NAME=signature_crm
DB_USER=crm_user

# Backend Configuration
JWT_SECRET=your_super_secure_jwt_secret_here_64_characters_minimum
NODE_ENV=production
PORT=3001

# CORS Configuration (replace with your domain)
CORS_ORIGIN=http://your-domain.com

# Frontend Configuration (replace with your domain)
REACT_APP_API_URL=http://your-domain.com/api
REACT_APP_ENVIRONMENT=production

# Email Configuration (Optional - configure later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@signatureproperties.com
FROM_NAME=Signature Properties CRM

# WhatsApp Configuration (Optional - configure later)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
```

**💡 Important Notes:**
- Replace `your-domain.com` with your actual domain or VPS IP
- Use strong passwords for DB_PASSWORD and JWT_SECRET
- Email and WhatsApp settings can be configured later

---

## 🚀 Step 3: Deploy Using Docker

### 3.1 Quick Deployment (Recommended)
```bash
# Run the automated installation script
./install.sh
```

### 3.2 Manual Deployment (Alternative)
```bash
# Create necessary directories
mkdir -p logs uploads backups ssl

# Build and start all services
docker-compose up -d --build

# Wait for services to start (about 2-3 minutes)
sleep 120

# Check if all services are running
docker-compose ps
```

### 3.3 Verify Installation
```bash
# Check running containers
docker-compose ps

# Check logs if needed
docker-compose logs

# Check specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres
```

---

## 🌐 Step 4: Configure Domain/IP Access

### 4.1 For IP Access (Quick Setup)
```bash
# Your CRM will be available at:
echo "CRM URL: http://$(curl -s ifconfig.me)"
```

### 4.2 For Domain Setup
1. **Point your domain to your VPS IP** (in your domain registrar)
2. **Update nginx configuration:**
```bash
# Edit nginx config
nano nginx.conf

# Replace 'server_name _;' with 'server_name yourdomain.com;'
# Save and restart nginx
docker-compose restart nginx
```

### 4.3 Configure Firewall
```bash
# Allow HTTP and HTTPS traffic
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # Keep SSH access
ufw --force enable
```

---

## 🔐 Step 5: Access Your CRM

### 5.1 Open Your CRM
Open your web browser and navigate to:
- **With Domain**: `http://yourdomain.com`
- **With IP**: `http://your-vps-ip`

### 5.2 Login Credentials
Use these demo credentials:

**Quick Login:**
- Username: `admin`
- Password: `admin`

**Other Options:**
- Email: `admin@signatureproperties.com` / Password: `admin123`
- Email: `manager@signatureproperties.com` / Password: `manager123`
- Email: `sales@signatureproperties.com` / Password: `sales123`

---

## 🛠️ Step 6: Management Commands

### 6.1 Daily Operations
```bash
# Navigate to project directory
cd /opt/signature-crm

# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Update application (when you push changes)
git pull origin main
docker-compose down
docker-compose up -d --build
```

### 6.2 Backup Commands
```bash
# Manual backup
./backup.sh

# View backups
ls -la backups/

# Restore database (if needed)
docker exec -i signature-crm-db psql -U crm_user -d signature_crm < backups/your-backup.sql
```

---

## 🔒 Step 7: SSL Certificate (Optional but Recommended)

### 7.1 Install Certbot (for Let's Encrypt)
```bash
# Install certbot
apt install -y certbot

# Stop nginx temporarily
docker-compose stop nginx

# Get SSL certificate (replace with your domain)
certbot certonly --standalone -d yourdomain.com

# Copy certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
```

### 7.2 Enable HTTPS
```bash
# Edit nginx config to enable HTTPS section
nano nginx.conf

# Uncomment the HTTPS server block and update server_name
# Restart nginx
docker-compose start nginx
```

---

## 📱 Step 8: aaPanel Integration (Optional)

### 8.1 Install aaPanel (if not already installed)
```bash
# Install aaPanel
URL=https://www.aapanel.com/script/install_6.0_en.sh && if [ -f /usr/bin/curl ];then curl -ksSO "$URL" ;else wget --no-check-certificate -O install_6.0_en.sh "$URL";fi && bash install_6.0_en.sh aapanel
```

### 8.2 Access aaPanel
- Open: `http://your-vps-ip:7800`
- Login with credentials shown after installation

### 8.3 Add Site in aaPanel
1. **Website** → **Add Site**
2. **Domain**: Your domain or IP
3. **Root Directory**: `/opt/signature-crm`
4. **PHP Version**: Not needed (we're using Docker)

### 8.4 Configure Reverse Proxy in aaPanel
1. **Website** → **Your Site** → **Reverse Proxy**
2. **Target URL**: `http://127.0.0.1:80`
3. **Enable**: SSL (if you have certificate)

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Services Not Starting
```bash
# Check Docker status
systemctl status docker

# Check disk space
df -h

# Check logs
docker-compose logs

# Restart Docker
systemctl restart docker
docker-compose up -d
```

#### 2. Port Already in Use
```bash
# Check what's using port 80
netstat -tulpn | grep :80

# Stop conflicting service (example: Apache)
systemctl stop apache2
systemctl disable apache2

# Restart your services
docker-compose up -d
```

#### 3. Database Connection Issues
```bash
# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Check database is running
docker exec -it signature-crm-db psql -U crm_user -d signature_crm -c "SELECT 1;"
```

#### 4. Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose down
docker-compose up -d --build frontend
```

#### 5. Permission Issues
```bash
# Fix ownership
chown -R root:root /opt/signature-crm

# Fix permissions
chmod -R 755 /opt/signature-crm
chmod +x *.sh
```

---

## 📞 Support

### Getting Help
1. **Check Logs**: `docker-compose logs -f`
2. **Restart Services**: `docker-compose restart`
3. **View System Resources**: `htop` or `top`
4. **Check Disk Space**: `df -h`

### Important Files
- **Environment**: `/opt/signature-crm/.env`
- **Logs**: `/opt/signature-crm/logs/`
- **Backups**: `/opt/signature-crm/backups/`
- **SSL Certificates**: `/opt/signature-crm/ssl/`

### System Status
```bash
# Quick system check
cd /opt/signature-crm

echo "=== Docker Services ==="
docker-compose ps

echo "=== System Resources ==="
free -h
df -h

echo "=== CRM Status ==="
curl -s http://localhost/api/health || echo "API not responding"
```

---

## 🎉 Success!

Your Signature Properties CRM is now installed and running!

**Next Steps:**
1. ✅ Access your CRM at your domain/IP
2. ✅ Login with demo credentials
3. ✅ Change default passwords in Settings
4. ✅ Configure email settings (optional)
5. ✅ Configure WhatsApp Business API (optional)
6. ✅ Set up SSL certificate (recommended)
7. ✅ Configure daily backups

**Your CRM includes:**
- 📊 Dashboard with analytics
- 👥 Lead management
- 🎯 Opportunity pipeline
- 📅 Site visit tracking
- 💬 WhatsApp integration
- 📊 Reports and insights
- ⚙️ Complete settings management

Enjoy your new CRM system! 🚀