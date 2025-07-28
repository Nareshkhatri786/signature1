#!/bin/bash

# Quick deployment script for aaPanel users
# This script can be run directly on your VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Signature Properties CRM Deploy${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

print_header

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    print_status "Docker installed successfully"
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
fi

# Create installation directory
mkdir -p /opt/signature-crm
cd /opt/signature-crm

# Download the CRM files (you would upload these to your server)
print_status "Setting up CRM files..."

# For now, we'll assume files are already in the current directory
# In a real deployment, you would:
# wget https://github.com/your-repo/signature-crm/archive/main.zip
# unzip main.zip
# cp -r signature-crm-main/* .

# Generate environment file
print_status "Generating configuration..."
cat > .env << EOF
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=signature_crm
DB_USER=crm_user
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:3000
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=production
EOF

# Create necessary directories
mkdir -p logs uploads backups ssl

# Start the application
print_status "Starting Signature Properties CRM..."
docker-compose up -d --build

# Wait for services
print_status "Waiting for services to start..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ CRM is running successfully!"
    echo ""
    echo -e "${GREEN}Access your CRM at:${NC}"
    echo -e "  ${BLUE}http://$(hostname -I | awk '{print $1}')${NC}"
    echo ""
    echo -e "${GREEN}Default Login:${NC}"
    echo -e "  Email: ${BLUE}admin${NC}"
    echo -e "  Password: ${BLUE}admin${NC}"
    echo ""
    echo -e "${GREEN}Management:${NC}"
    echo -e "  Start: ${BLUE}cd /opt/signature-crm && docker-compose up -d${NC}"
    echo -e "  Stop: ${BLUE}cd /opt/signature-crm && docker-compose down${NC}"
    echo -e "  Logs: ${BLUE}cd /opt/signature-crm && docker-compose logs${NC}"
else
    print_error "❌ Some services failed to start"
    echo "Check logs with: docker-compose logs"
    exit 1
fi

print_status "🎉 Deployment completed successfully!"