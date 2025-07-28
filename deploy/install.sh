#!/bin/bash
# Installation script for CRM system on Linux VPS

set -e  # Exit on any error

echo "🚀 Installing Signature Properties CRM System"
echo "=============================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root for security reasons"
   echo "   Please run as a regular user with sudo privileges"
   exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18 LTS
echo "📦 Installing Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Install Docker (optional but recommended)
echo "📦 Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/crm
sudo chown $USER:$USER /opt/crm

# Setup PostgreSQL
echo "🗄️ Setting up PostgreSQL..."
sudo -u postgres createuser --interactive --pwprompt crmuser || true
sudo -u postgres createdb -O crmuser crm_db || true

# Create systemd service file
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/crm.service > /dev/null << EOF
[Unit]
Description=Signature Properties CRM
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/crm
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/crm/.env

[Install]
WantedBy=multi-user.target
EOF

# Setup firewall
echo "🔒 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001
sudo ufw --force enable

# Setup logrotate
echo "📜 Setting up log rotation..."
sudo tee /etc/logrotate.d/crm > /dev/null << EOF
/opt/crm/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 $USER $USER
    postrotate
        systemctl reload crm
    endscript
}
EOF

# Create logs directory
mkdir -p /opt/crm/logs

echo "✅ Installation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Clone your CRM code to /opt/crm"
echo "2. Copy .env.example to .env and configure your database settings"
echo "3. Run 'npm install' in /opt/crm"
echo "4. Initialize database with 'npm run db:setup'"
echo "5. Start the service with 'sudo systemctl enable crm && sudo systemctl start crm'"
echo ""
echo "⚠️  Please logout and login again for Docker group changes to take effect"