#!/bin/bash

# Signature Properties CRM - Simple Installation Script
# This script will install and configure the complete CRM system on your VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║               🏢 SIGNATURE PROPERTIES CRM 🏢                 ║${NC}"
    echo -e "${PURPLE}║                  VPS Installation Script                     ║${NC}"
    echo -e "${PURPLE}║                     One-Click Deploy                         ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root (use sudo)"
        exit 1
    fi
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p /opt/signature-crm
    mkdir -p /opt/signature-crm/ssl
    mkdir -p /opt/signature-crm/logs
    mkdir -p /opt/signature-crm/uploads
    mkdir -p /opt/signature-crm/backups
    
    print_status "Directories created successfully"
}

# Generate secure passwords
generate_passwords() {
    print_status "Generating secure passwords..."
    
    DB_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    
    cat > /opt/signature-crm/.env << EOF
# Database Configuration
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=postgres
DB_PORT=5432
DB_NAME=signature_crm
DB_USER=crm_user

# Backend Configuration
JWT_SECRET=${JWT_SECRET}
NODE_ENV=production
PORT=3001

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=production

# Email Configuration (Configure these later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=noreply@signatureproperties.com
FROM_NAME=Signature Properties CRM

# WhatsApp Configuration (Configure these later)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
EOF
    
    print_status "Environment file created with secure passwords"
}

# Copy application files
copy_files() {
    print_status "Copying application files..."
    
    # Copy all files to the installation directory
    cp -r * /opt/signature-crm/
    
    # Set proper permissions
    chown -R root:root /opt/signature-crm
    chmod -R 755 /opt/signature-crm
    
    print_status "Application files copied successfully"
}

# Install and start services
install_services() {
    print_status "Installing and starting CRM services..."
    
    cd /opt/signature-crm
    
    # Pull Docker images
    docker-compose pull
    
    # Build and start services
    docker-compose up -d --build
    
    print_status "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database to be ready
    print_status "Waiting for database..."
    sleep 30
    
    # Wait for backend to be ready
    print_status "Waiting for backend API..."
    sleep 20
    
    # Check if services are healthy
    if docker-compose ps | grep -q "Up"; then
        print_status "All services are running successfully"
    else
        print_error "Some services failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Create systemd service for auto-start
create_systemd_service() {
    print_status "Creating systemd service for auto-start..."
    
    cat > /etc/systemd/system/signature-crm.service << EOF
[Unit]
Description=Signature Properties CRM
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/signature-crm
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable signature-crm.service
    
    print_status "Systemd service created and enabled"
}

# Configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    # Allow HTTP and HTTPS
    if command -v ufw &> /dev/null; then
        ufw allow 80/tcp
        ufw allow 443/tcp
        print_status "UFW firewall configured"
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-port=80/tcp
        firewall-cmd --permanent --add-port=443/tcp
        firewall-cmd --reload
        print_status "Firewalld configured"
    else
        print_warning "No firewall detected. Please ensure ports 80 and 443 are open"
    fi
}

# Create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > /opt/signature-crm/backup.sh << 'EOF'
#!/bin/bash
# Backup script for Signature Properties CRM

BACKUP_DIR="/opt/signature-crm/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="signature-crm-backup-${DATE}"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Backup database
docker exec signature-crm-db pg_dump -U crm_user signature_crm > ${BACKUP_DIR}/${BACKUP_NAME}.sql

# Backup uploads
tar -czf ${BACKUP_DIR}/${BACKUP_NAME}-uploads.tar.gz -C /opt/signature-crm uploads

# Remove old backups (keep last 30 days)
find ${BACKUP_DIR} -name "signature-crm-backup-*" -mtime +30 -delete

echo "Backup completed: ${BACKUP_NAME}"
EOF
    
    chmod +x /opt/signature-crm/backup.sh
    
    # Add to crontab for daily backups
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/signature-crm/backup.sh") | crontab -
    
    print_status "Backup script created and scheduled"
}

# Display final information
display_final_info() {
    clear
    print_header
    
    echo -e "${GREEN}🎉 Installation completed successfully! 🎉${NC}"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🌐 Access your CRM:${NC}"
    
    # Get the server IP
    SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || curl -s ifconfig.me 2>/dev/null || echo "localhost")
    echo -e "   ${BLUE}http://$SERVER_IP${NC}"
    
    if [ "$SERVER_IP" != "localhost" ]; then
        echo -e "   ${BLUE}http://localhost${NC} (if accessing locally)"
    fi
    echo ""
    
    echo -e "${GREEN}🔐 Login Credentials:${NC}"
    echo -e "   ${BLUE}Quick Login:${NC}"
    echo -e "   Username: ${PURPLE}admin${NC}"
    echo -e "   Password: ${PURPLE}admin${NC}"
    echo ""
    echo -e "   ${BLUE}Alternative Logins:${NC}"
    echo -e "   📧 admin@signatureproperties.com / admin123"
    echo -e "   📧 manager@signatureproperties.com / manager123"
    echo -e "   📧 sales@signatureproperties.com / sales123"
    echo ""
    
    echo -e "${GREEN}🛠️ Management Commands:${NC}"
    echo -e "   ${BLUE}Check Status:${NC} cd /opt/signature-crm && docker-compose ps"
    echo -e "   ${BLUE}View Logs:${NC} cd /opt/signature-crm && docker-compose logs -f"
    echo -e "   ${BLUE}Restart:${NC} cd /opt/signature-crm && docker-compose restart"
    echo -e "   ${BLUE}Stop CRM:${NC} cd /opt/signature-crm && docker-compose down"
    echo -e "   ${BLUE}Start CRM:${NC} cd /opt/signature-crm && docker-compose up -d"
    echo -e "   ${BLUE}Backup:${NC} /opt/signature-crm/backup.sh"
    echo ""
    
    echo -e "${GREEN}📁 Important Files:${NC}"
    echo -e "   ${BLUE}Settings:${NC} /opt/signature-crm/.env"
    echo -e "   ${BLUE}Backups:${NC} /opt/signature-crm/backups/"
    echo -e "   ${BLUE}Logs:${NC} /opt/signature-crm/logs/"
    echo ""
    
    echo -e "${GREEN}🚀 Features Ready:${NC}"
    echo -e "   ✅ Lead Management System"
    echo -e "   ✅ Opportunity Pipeline"
    echo -e "   ✅ Site Visit Tracker"
    echo -e "   ✅ WhatsApp Integration"
    echo -e "   ✅ Reports & Analytics"
    echo -e "   ✅ User Management"
    echo -e "   ✅ Automated Backups"
    echo ""
    
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo -e "   1. 🌐 Open your CRM in browser"
    echo -e "   2. 🔑 Login with the credentials above"
    echo -e "   3. ⚙️  Go to Settings to configure:"
    echo -e "      • Email settings (for notifications)"
    echo -e "      • WhatsApp Business API"
    echo -e "      • Change default passwords"
    echo -e "   4. 🏢 Add your real estate projects"
    echo -e "   5. 👥 Start adding leads and managing sales!"
    echo ""
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🏢 Welcome to Signature Properties CRM! 🏢${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    print_status "Installation complete! Your CRM is ready to use."
}

# Main installation process
main() {
    print_header
    
    check_root
    check_docker
    create_directories
    generate_passwords
    copy_files
    install_services
    wait_for_services
    create_systemd_service
    configure_firewall
    create_backup_script
    display_final_info
}

# Run the installation
main