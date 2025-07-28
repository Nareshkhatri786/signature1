#!/bin/bash

# Signature Properties CRM - Automated VPS Deployment Script
# This script provides a fully automated deployment experience

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Banner
print_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
    ███████╗██╗ ██████╗ ███╗   ██╗ █████╗ ████████╗██╗   ██╗██████╗ ███████╗
    ██╔════╝██║██╔════╝ ████╗  ██║██╔══██╗╚══██╔══╝██║   ██║██╔══██╗██╔════╝
    ███████╗██║██║  ███╗██╔██╗ ██║███████║   ██║   ██║   ██║██████╔╝█████╗  
    ╚════██║██║██║   ██║██║╚██╗██║██╔══██║   ██║   ██║   ██║██╔══██╗██╔══╝  
    ███████║██║╚██████╔╝██║ ╚████║██║  ██║   ██║   ╚██████╔╝██║  ██║███████╗
    ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝
                                                                            
    ██████╗ ██████╗  ██████╗ ██████╗ ███████╗██████╗ ████████╗██╗███████╗███████╗
    ██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██║██╔════╝██╔════╝
    ██████╔╝██████╔╝██║   ██║██████╔╝█████╗  ██████╔╝   ██║   ██║█████╗  ███████╗
    ██╔═══╝ ██╔══██╗██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗   ██║   ██║██╔══╝  ╚════██║
    ██║     ██║  ██║╚██████╔╝██║     ███████╗██║  ██║   ██║   ██║███████╗███████║
    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝╚══════╝╚══════╝
                                                                                
                    🏢 Real Estate CRM - Automated VPS Installer 🚀
EOF
    echo -e "${NC}"
}

# Utility functions
print_status() {
    echo -e "${GREEN}✅ [INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  [WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}❌ [ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}🔄 [STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}🎉 [SUCCESS]${NC} $1"
}

# Progress bar function
show_progress() {
    local duration=$1
    local message=$2
    
    echo -ne "${CYAN}$message${NC}"
    for ((i=0; i<=100; i+=2)); do
        printf "\r${CYAN}$message${NC} ["
        printf "%0.s#" $(seq 1 $((i/2)))
        printf "%0.s " $(seq 1 $((50-i/2)))
        printf "] %d%%" $i
        sleep $(echo "scale=2; $duration/50" | bc -l 2>/dev/null || echo "0.1")
    done
    echo ""
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root (use sudo)"
        exit 1
    fi
}

# Detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        print_error "Cannot detect OS. Please install manually."
        exit 1
    fi
    print_status "Detected OS: $OS $VER"
}

# Check system requirements
check_requirements() {
    print_step "Checking system requirements..."
    
    # Check RAM
    RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
    if [ $RAM_GB -lt 1 ]; then
        print_warning "Low RAM detected (${RAM_GB}GB). Minimum 2GB recommended."
    else
        print_status "RAM: ${RAM_GB}GB ✓"
    fi
    
    # Check disk space
    DISK_GB=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
    if [ $DISK_GB -lt 10 ]; then
        print_error "Insufficient disk space (${DISK_GB}GB). Minimum 10GB required."
        exit 1
    else
        print_status "Disk space: ${DISK_GB}GB ✓"
    fi
    
    # Check internet connectivity
    if ping -c 1 google.com &> /dev/null; then
        print_status "Internet connectivity ✓"
    else
        print_error "No internet connection detected"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_step "Installing system dependencies..."
    
    case $OS in
        *"Ubuntu"*|*"Debian"*)
            show_progress 10 "Updating package lists..."
            apt update -qq
            
            show_progress 20 "Installing essential packages..."
            apt install -y git curl wget unzip bc openssl
            ;;
        *"CentOS"*|*"Red Hat"*)
            show_progress 10 "Updating package lists..."
            yum update -y -q
            
            show_progress 20 "Installing essential packages..."
            yum install -y git curl wget unzip bc openssl
            ;;
        *)
            print_error "Unsupported OS. Please install dependencies manually."
            exit 1
            ;;
    esac
    
    print_status "Dependencies installed successfully"
}

# Install Docker
install_docker() {
    print_step "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        print_status "Docker already installed"
    else
        show_progress 30 "Downloading and installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh > /dev/null 2>&1
        rm get-docker.sh
        
        systemctl start docker
        systemctl enable docker
        print_status "Docker installed and started"
    fi
    
    # Install Docker Compose
    if command -v docker-compose &> /dev/null; then
        print_status "Docker Compose already installed"
    else
        show_progress 15 "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        print_status "Docker Compose installed"
    fi
}

# Get user input for configuration
get_user_config() {
    print_step "Configuration setup..."
    
    echo -e "${PURPLE}Please provide the following information:${NC}"
    
    # Get repository URL
    read -p "🔗 Enter your repository URL (or press Enter for default): " REPO_URL
    if [ -z "$REPO_URL" ]; then
        REPO_URL="https://github.com/signature-properties/crm.git"
    fi
    
    # Get domain or use IP
    read -p "🌐 Enter your domain name (or press Enter to use IP): " DOMAIN
    if [ -z "$DOMAIN" ]; then
        DOMAIN=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip)
        print_status "Using IP address: $DOMAIN"
    else
        print_status "Using domain: $DOMAIN"
    fi
    
    # Ask about SSL
    read -p "🔒 Do you want to setup SSL certificate? (y/N): " SETUP_SSL
    
    # Ask about email configuration
    read -p "📧 Configure email settings now? (y/N): " SETUP_EMAIL
    if [[ $SETUP_EMAIL =~ ^[Yy]$ ]]; then
        read -p "📬 SMTP Host (e.g., smtp.gmail.com): " SMTP_HOST
        read -p "📭 SMTP Port (e.g., 587): " SMTP_PORT
        read -p "📮 Email Username: " EMAIL_USER
        read -s -p "🔑 Email Password: " EMAIL_PASS
        echo ""
    fi
}

# Clone repository
clone_repository() {
    print_step "Setting up application files..."
    
    # Remove existing directory if it exists
    if [ -d "/opt/signature-crm" ]; then
        print_warning "Existing installation found. Backing up..."
        mv /opt/signature-crm "/opt/signature-crm-backup-$(date +%Y%m%d-%H%M%S)"
    fi
    
    show_progress 20 "Cloning repository..."
    cd /opt
    git clone "$REPO_URL" signature-crm > /dev/null 2>&1
    cd signature-crm
    
    # Make scripts executable
    chmod +x *.sh 2>/dev/null || true
    chmod +x deploy/*.sh 2>/dev/null || true
    
    print_status "Repository cloned successfully"
}

# Generate configuration
generate_config() {
    print_step "Generating secure configuration..."
    
    show_progress 15 "Creating environment file..."
    
    # Generate secure passwords
    DB_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    
    # Create .env file
    cat > .env << EOF
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
CORS_ORIGIN=http://${DOMAIN}

# Frontend Configuration
REACT_APP_API_URL=http://${DOMAIN}/api
REACT_APP_ENVIRONMENT=production

# Email Configuration
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
SMTP_PORT=${SMTP_PORT:-587}
SMTP_USER=${EMAIL_USER:-}
SMTP_PASSWORD=${EMAIL_PASS:-}
FROM_EMAIL=noreply@signatureproperties.com
FROM_NAME=Signature Properties CRM

# WhatsApp Configuration (configure later)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# SSL Configuration
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
EOF

    print_status "Configuration generated with secure passwords"
}

# Setup directories
setup_directories() {
    print_step "Creating necessary directories..."
    
    mkdir -p logs uploads backups ssl
    chown -R root:root .
    chmod -R 755 .
    
    print_status "Directories created successfully"
}

# Configure firewall
configure_firewall() {
    print_step "Configuring firewall..."
    
    if command -v ufw &> /dev/null; then
        ufw --force enable > /dev/null 2>&1
        ufw allow 22/tcp > /dev/null 2>&1  # SSH
        ufw allow 80/tcp > /dev/null 2>&1  # HTTP
        ufw allow 443/tcp > /dev/null 2>&1 # HTTPS
        print_status "UFW firewall configured"
    elif command -v firewall-cmd &> /dev/null; then
        systemctl start firewalld > /dev/null 2>&1
        systemctl enable firewalld > /dev/null 2>&1
        firewall-cmd --permanent --add-port=22/tcp > /dev/null 2>&1
        firewall-cmd --permanent --add-port=80/tcp > /dev/null 2>&1
        firewall-cmd --permanent --add-port=443/tcp > /dev/null 2>&1
        firewall-cmd --reload > /dev/null 2>&1
        print_status "Firewalld configured"
    else
        print_warning "No firewall detected. Please configure manually."
    fi
}

# Deploy application
deploy_application() {
    print_step "Deploying CRM application..."
    
    show_progress 30 "Building Docker containers..."
    docker-compose pull > /dev/null 2>&1
    docker-compose up -d --build > /dev/null 2>&1
    
    show_progress 60 "Waiting for services to start..."
    sleep 60
    
    # Health check
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -sf http://localhost/api/health > /dev/null 2>&1; then
            break
        fi
        printf "\r${CYAN}Health check... attempt $attempt/$max_attempts${NC}"
        sleep 5
        ((attempt++))
    done
    echo ""
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Services failed to start properly"
        print_warning "Check logs with: docker-compose logs"
        exit 1
    fi
    
    print_status "Application deployed successfully"
}

# Setup SSL certificate
setup_ssl() {
    if [[ $SETUP_SSL =~ ^[Yy]$ ]] && [ "$DOMAIN" != "$(curl -s ifconfig.me)" ]; then
        print_step "Setting up SSL certificate..."
        
        # Install certbot
        if command -v apt &> /dev/null; then
            apt install -y certbot > /dev/null 2>&1
        elif command -v yum &> /dev/null; then
            yum install -y certbot > /dev/null 2>&1
        fi
        
        # Stop nginx temporarily
        docker-compose stop nginx
        
        # Get certificate
        show_progress 20 "Obtaining SSL certificate..."
        if certbot certonly --standalone -d "$DOMAIN" --agree-tos --no-eff-email --register-unsafely-without-email > /dev/null 2>&1; then
            # Copy certificates
            cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ssl/cert.pem
            cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ssl/key.pem
            
            # Update nginx config to enable HTTPS
            sed -i 's/#.*server {/    server {/' nginx.conf
            sed -i "s/server_name yourdomain.com;/server_name $DOMAIN;/" nginx.conf
            
            print_status "SSL certificate installed"
        else
            print_warning "SSL certificate setup failed. Continuing without SSL."
        fi
        
        # Restart nginx
        docker-compose start nginx
    fi
}

# Create management scripts
create_management_scripts() {
    print_step "Creating management scripts..."
    
    # Create backup script
    cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="signature-crm-backup-${DATE}"

mkdir -p ${BACKUP_DIR}

# Backup database
docker exec signature-crm-db pg_dump -U crm_user signature_crm > ${BACKUP_DIR}/${BACKUP_NAME}.sql

# Backup uploads
tar -czf ${BACKUP_DIR}/${BACKUP_NAME}-uploads.tar.gz uploads/

# Remove old backups (keep last 30 days)
find ${BACKUP_DIR} -name "signature-crm-backup-*" -mtime +30 -delete

echo "Backup completed: ${BACKUP_NAME}"
EOF

    # Create status script
    cat > status.sh << 'EOF'
#!/bin/bash
echo "=== Signature Properties CRM Status ==="
echo ""
echo "Docker Services:"
docker-compose ps
echo ""
echo "System Resources:"
echo "RAM: $(free -h | awk '/^Mem:/{print $3"/"$2}')"
echo "Disk: $(df -h / | awk 'NR==2{print $3"/"$2" ("$5")"}')"
echo ""
echo "Application Health:"
curl -s http://localhost/api/health && echo "✅ API: Healthy" || echo "❌ API: Not responding"
echo ""
echo "Access URL: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost')"
EOF

    # Create update script
    cat > update.sh << 'EOF'
#!/bin/bash
echo "Updating Signature Properties CRM..."
git pull origin main
docker-compose down
docker-compose up -d --build
echo "Update completed!"
EOF

    chmod +x backup.sh status.sh update.sh
    
    # Setup automatic backup cron job
    (crontab -l 2>/dev/null; echo "0 2 * * * cd /opt/signature-crm && ./backup.sh") | crontab -
    
    print_status "Management scripts created"
}

# Create systemd service
create_systemd_service() {
    print_step "Creating systemd service..."
    
    cat > /etc/systemd/system/signature-crm.service << EOF
[Unit]
Description=Signature Properties CRM
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/signature-crm
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable signature-crm.service
    
    print_status "Systemd service created and enabled"
}

# Display final information
display_success() {
    clear
    print_banner
    
    echo -e "${GREEN}🎉 Installation completed successfully! 🎉${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📊 SIGNATURE PROPERTIES CRM - READY TO USE${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${GREEN}🌐 Access URL:${NC}"
    if [[ $SETUP_SSL =~ ^[Yy]$ ]] && [ -f "ssl/cert.pem" ]; then
        echo -e "   ${BLUE}🔒 https://$DOMAIN${NC}"
    else
        echo -e "   ${BLUE}🌍 http://$DOMAIN${NC}"
    fi
    echo ""
    echo -e "${GREEN}🔐 Login Credentials:${NC}"
    echo -e "   ${BLUE}Username:${NC} admin"
    echo -e "   ${BLUE}Password:${NC} admin"
    echo ""
    echo -e "   ${BLUE}Alternative:${NC}"
    echo -e "   ${BLUE}Email:${NC} admin@signatureproperties.com"
    echo -e "   ${BLUE}Password:${NC} admin123"
    echo ""
    echo -e "${GREEN}🛠️ Management Commands:${NC}"
    echo -e "   ${BLUE}Status:${NC} cd /opt/signature-crm && ./status.sh"
    echo -e "   ${BLUE}Backup:${NC} cd /opt/signature-crm && ./backup.sh"
    echo -e "   ${BLUE}Update:${NC} cd /opt/signature-crm && ./update.sh"
    echo -e "   ${BLUE}Logs:${NC} cd /opt/signature-crm && docker-compose logs -f"
    echo ""
    echo -e "${GREEN}📁 Important Locations:${NC}"
    echo -e "   ${BLUE}Application:${NC} /opt/signature-crm"
    echo -e "   ${BLUE}Configuration:${NC} /opt/signature-crm/.env"
    echo -e "   ${BLUE}Backups:${NC} /opt/signature-crm/backups"
    echo -e "   ${BLUE}Logs:${NC} /opt/signature-crm/logs"
    echo ""
    echo -e "${GREEN}🚀 Features Available:${NC}"
    echo -e "   ✅ Lead Management"
    echo -e "   ✅ Opportunity Pipeline"
    echo -e "   ✅ Site Visit Tracking"
    echo -e "   ✅ WhatsApp Integration"
    echo -e "   ✅ Reports & Analytics"
    echo -e "   ✅ User Management"
    echo -e "   ✅ Complete Settings"
    echo -e "   ✅ Automated Backups"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo -e "   1. Access your CRM and login"
    echo -e "   2. Change default passwords"
    echo -e "   3. Configure email settings (if not done)"
    echo -e "   4. Set up WhatsApp Business API"
    echo -e "   5. Add your real estate projects"
    echo -e "   6. Start managing leads!"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Thank you for using Signature Properties CRM! 🏢${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Main installation process
main() {
    print_banner
    
    print_step "Starting automated installation..."
    
    check_root
    detect_os
    check_requirements
    install_dependencies
    install_docker
    get_user_config
    clone_repository
    generate_config
    setup_directories
    configure_firewall
    deploy_application
    setup_ssl
    create_management_scripts
    create_systemd_service
    
    display_success
}

# Run the installation
main "$@"