# 🚀 One-Click Installation Guide

Transform your VPS deployment into a WordPress-like installation experience!

## 📦 What You Get

- **🌐 Web-Based Installer**: No command line required
- **🔧 Guided Setup**: Step-by-step configuration wizard
- **🛡️ Secure Configuration**: Automatic password generation and validation
- **📊 Database Setup**: Automated schema creation and seeding
- **👤 Admin Creation**: Set up your administrator account
- **🔒 Installation Lock**: Prevents accidental re-installation

---

## 🎯 Quick Start (3 Steps)

### Step 1: Upload Files
Upload your project files to your VPS in any directory (e.g., `/opt/signature-crm/`)

### Step 2: Start Services
```bash
docker-compose up -d
```

### Step 3: Complete Installation
Open your browser and navigate to:
- `http://your-vps-ip` (or your domain)
- You'll be automatically redirected to the installation wizard

---

## 🔧 Installation Wizard Features

### 1. **Database Configuration**
- **Pre-filled defaults** for Docker setup
- **Connection testing** before proceeding
- **Validation** of all database parameters
- **Clear error messages** for troubleshooting

### 2. **Application Settings**
- **Automatic JWT secret generation**
- **CORS origin configuration**
- **Security-focused defaults**

### 3. **Admin User Setup**
- **Full name and email**
- **Password confirmation**
- **Input validation**
- **Secure password hashing**

### 4. **Automated Installation**
- **Database schema creation**
- **Sample data insertion**
- **Configuration file generation**
- **Admin user creation**
- **Installation lock creation**

---

## 🛡️ Security Features

### ✅ **Installation Protection**
- One-time installation only
- Automatic lock file creation
- Protected API endpoints during installation
- Installation removal only in development mode

### ✅ **Password Security**
- Bcrypt hashing with salt rounds
- Password confirmation validation
- Secure JWT secret generation
- Environment variable protection

### ✅ **Database Security**
- Connection validation
- SQL injection prevention
- Proper error handling
- Transaction-based operations

---

## 📱 User Experience

### **WordPress-Like Interface**
- Clean, modern design
- Progress indicators
- Step-by-step guidance
- Clear success/error messages
- Responsive layout

### **Error Handling**
- Comprehensive validation
- User-friendly error messages
- Rollback on failure
- Detailed logging

### **Success Flow**
1. **Installation completion** message
2. **Automatic redirect** to login page
3. **Admin credentials** ready to use
4. **Full CRM access** immediately

---

## 🔄 Post-Installation

### **What Happens Next**
- ✅ Database tables created
- ✅ Sample projects added
- ✅ Admin user configured
- ✅ API endpoints active
- ✅ Frontend ready to use

### **Login Credentials**
Use the admin credentials you set during installation:
- **Email**: Your chosen email address
- **Password**: Your chosen password

### **Demo Data Available**
- 4 sample real estate projects
- Various lead sources and stages
- Opportunity pipeline examples
- User role demonstrations

---

## 🛠️ Technical Details

### **Docker Services**
- **PostgreSQL**: Database with persistent storage
- **Node.js Backend**: API server with installer routes
- **React Frontend**: Modern UI with installation wizard
- **Nginx**: Reverse proxy and static file serving

### **Installation API Endpoints**
- `GET /api/install/status` - Check installation status
- `POST /api/install/test-database` - Test database connection
- `POST /api/install/complete` - Complete installation
- `DELETE /api/install/remove` - Remove installation (dev only)

### **File Structure After Installation**
```
├── server/.env                 # Generated configuration
├── server/.install-lock        # Installation lock file
├── server/logs/               # Application logs
├── postgres_data/             # Database files
└── ssl/                       # SSL certificates (optional)
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### Database Connection Failed
- Check PostgreSQL container is running
- Verify database credentials
- Ensure network connectivity
- Check firewall settings

#### Installation Wizard Not Loading
- Verify all containers are running: `docker-compose ps`
- Check nginx logs: `docker-compose logs nginx`
- Ensure port 80 is available

#### Installation Already Completed
- Remove lock file: `rm server/.install-lock`
- Restart services: `docker-compose restart`
- **Warning**: This will allow re-installation

### **Useful Commands**
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Remove installation (development only)
rm server/.install-lock
docker-compose restart backend

# Full reset (removes all data)
docker-compose down -v
docker-compose up -d
```

---

## 🎉 Success!

Your Signature Properties CRM is now installed and ready to use with:

- 🏢 **Complete Lead Management**
- 📊 **Opportunity Pipeline**
- 📅 **Site Visit Scheduling**
- 💬 **WhatsApp Integration Ready**
- 📈 **Analytics Dashboard**
- ⚙️ **Full Settings Control**

**Next Steps:**
1. Login to your CRM
2. Explore the dashboard
3. Configure email/WhatsApp settings
4. Start managing your real estate leads!

---

## 📞 Support

**Installation Issues?**
- Check Docker logs
- Verify database connection
- Ensure all ports are available
- Review nginx configuration

**Post-Installation Help?**
- Access the Settings module
- Configure your business details
- Set up email notifications
- Customize the pipeline stages

Your CRM is now ready for professional real estate management! 🚀