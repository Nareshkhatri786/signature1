#!/bin/bash
# Deployment script for CRM system

set -e

CRM_DIR="/opt/crm"
BACKUP_DIR="/opt/crm_backups"
SERVICE_NAME="crm"

echo "🚀 Deploying Signature Properties CRM"
echo "====================================="

# Create backup directory if it doesn't exist
sudo mkdir -p $BACKUP_DIR

# Stop the service
echo "⏸️ Stopping CRM service..."
sudo systemctl stop $SERVICE_NAME || true

# Create backup of current deployment
if [ -d "$CRM_DIR" ]; then
    echo "💾 Creating backup..."
    BACKUP_NAME="crm_backup_$(date +%Y%m%d_%H%M%S)"
    sudo cp -r $CRM_DIR "$BACKUP_DIR/$BACKUP_NAME"
    echo "✅ Backup created: $BACKUP_DIR/$BACKUP_NAME"
fi

# Pull latest code (assuming git repository)
echo "📥 Pulling latest code..."
cd $CRM_DIR
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Run database migrations if any
echo "🗄️ Running database migrations..."
# npm run db:migrate  # Uncomment when you have migrations

# Update file permissions
echo "🔒 Setting file permissions..."
sudo chown -R $USER:$USER $CRM_DIR
sudo chmod -R 755 $CRM_DIR

# Restart service
echo "🔄 Starting CRM service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

# Wait for service to start
sleep 5

# Check service status
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ CRM service is running"
    echo "🌐 Application should be available at: http://$(hostname -I | awk '{print $1}'):3001"
else
    echo "❌ Failed to start CRM service"
    echo "📋 Check logs with: sudo journalctl -u $SERVICE_NAME -f"
    exit 1
fi

# Health check
echo "🏥 Performing health check..."
sleep 10
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "⚠️ Health check failed - check application logs"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "📊 Monitor the application with:"
echo "   - Service status: sudo systemctl status $SERVICE_NAME"
echo "   - Live logs: sudo journalctl -u $SERVICE_NAME -f"
echo "   - Application logs: tail -f $CRM_DIR/logs/app.log"