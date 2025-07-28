# Signature Properties CRM 🏢

A comprehensive Pre-Sales CRM system designed specifically for real estate businesses, featuring project-wise lead management, WhatsApp Business API integration, and advanced opportunity tracking.

## ✨ Features

### 🎯 Core CRM Functionality
- **Lead Management**: Capture, track, and nurture leads from multiple channels
- **Opportunity Pipeline**: Custom stages (Scheduled → Visit Done → Negotiation → Booking → Lost)
- **Site Visit Tracking**: Schedule and track property visits with smart filters
- **Project-Based Structure**: Organize leads and opportunities by real estate projects
- **Role-Based Access Control**: Admin, Project Manager, Sales Executive, Telecaller roles

### 📱 WhatsApp Business Integration
- **Automated Messaging**: Send welcome messages, follow-ups, and reminders
- **Nurturing Campaigns**: Automated lead nurturing sequences
- **Template Management**: Manage approved WhatsApp message templates
- **Business API Support**: Full integration with WhatsApp Business API

### 📊 Advanced Analytics
- **Dashboard Insights**: Real-time metrics and performance tracking
- **Team Reports**: User performance and activity reports
- **Lead Analytics**: Source tracking and conversion analysis
- **Revenue Tracking**: Deal value and pipeline analysis

### 🔧 System Features
- **Modern UI**: Professional, responsive design
- **Comprehensive Settings**: Full system configuration
- **Notification System**: Email, SMS, WhatsApp, and in-app notifications
- **Data Export**: Import/export functionality
- **Mobile Optimized**: Works perfectly on all devices

## 🚀 One-Click Installation

### For aaPanel Users

1. **Upload files** to your server
2. **Run the installation script**:
   ```bash
   sudo chmod +x install.sh
   sudo ./install.sh
   ```

### Quick Deploy (Alternative)

```bash
# Download and run the quick deploy script
curl -fsSL https://raw.githubusercontent.com/your-repo/signature-crm/main/deploy.sh -o deploy.sh
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

## 📋 System Requirements

- **Server**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 10GB available space
- **Docker**: Latest version
- **Ports**: 80, 443 (HTTP/HTTPS)

## 🔐 Default Login Credentials

After installation, use these credentials:

- **Email**: `admin@signatureproperties.com`
- **Password**: `admin123`

*Or use the quick login:*
- **Username**: `admin`
- **Password**: `admin`

## 🛠️ Post-Installation Setup

### 1. Configure Email Settings
Edit `/opt/signature-crm/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 2. Configure WhatsApp Business API
```env
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token
```

### 3. Set Up SSL Certificate
```bash
# Place your SSL certificates in /opt/signature-crm/ssl/
# Edit nginx.conf to enable HTTPS
```

## 🐳 Docker Services

The application runs using Docker Compose with the following services:

- **Frontend**: React application (Port 80)
- **Backend**: Node.js API server (Port 3001)
- **Database**: PostgreSQL (Port 5432)
- **Cache**: Redis (Port 6379)
- **Proxy**: Nginx reverse proxy

## 📝 Management Commands

```bash
# Navigate to installation directory
cd /opt/signature-crm

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# Restart specific service
docker-compose restart frontend

# Update application
docker-compose pull && docker-compose up -d --build
```

## 💾 Backup & Recovery

### Automatic Backups
Daily backups are automatically created at 2:00 AM in `/opt/signature-crm/backups/`

### Manual Backup
```bash
/opt/signature-crm/backup.sh
```

### Restore from Backup
```bash
# Restore database
docker exec -i signature-crm-db psql -U crm_user -d signature_crm < backup.sql

# Restore uploads
tar -xzf backup-uploads.tar.gz -C /opt/signature-crm/
```

## 🔧 Configuration

### Environment Variables
Key configuration options in `.env`:

```env
# Database
DB_PASSWORD=your-secure-password
DB_HOST=postgres
DB_NAME=signature_crm

# Security
JWT_SECRET=your-jwt-secret

# API URLs
REACT_APP_API_URL=http://localhost:3001/api

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password

# WhatsApp Configuration
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Granular permission system
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: Security headers and protection

## 📱 Mobile Support

- **Responsive Design**: Works on all screen sizes
- **Touch Optimized**: Mobile-friendly interactions
- **Offline Support**: Basic offline functionality
- **PWA Ready**: Progressive Web App capabilities

## 🔍 Troubleshooting

### Common Issues

1. **Services not starting**:
   ```bash
   docker-compose logs
   ```

2. **Database connection issues**:
   ```bash
   docker-compose restart postgres
   ```

3. **Port conflicts**:
   ```bash
   sudo netstat -tulpn | grep :80
   ```

### Performance Optimization

- **Database**: Regular maintenance and indexing
- **Redis**: Enable caching for better performance
- **Nginx**: Configure gzip compression
- **Docker**: Monitor resource usage

## 🆘 Support

For technical support:
- **Email**: support@signatureproperties.com
- **Documentation**: Check `/opt/signature-crm/docs/`
- **Logs**: Available in `/opt/signature-crm/logs/`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Made with ❤️ for Real Estate Professionals**

*Transform your real estate business with intelligent lead management and automated WhatsApp engagement.*