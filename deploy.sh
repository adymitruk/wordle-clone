#!/bin/bash
set -e

SERVER="apps.dymitruk.com"
APP_DIR="/var/www/apps.dymitruk.com/wordle"

echo "📦 Deploying Wordle to $SERVER..."

# Create remote directory
ssh "$SERVER" "sudo mkdir -p $APP_DIR && sudo chown www-data:www-data $APP_DIR"

# Sync files (exclude node_modules, we'll install fresh)
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'deploy.sh' \
  ./ "$SERVER:$APP_DIR/"

# Install dependencies and setup service
ssh "$SERVER" << 'ENDSSH'
cd /var/www/apps.dymitruk.com/wordle
sudo -u www-data npm install --production

# Install systemd service
sudo cp wordle.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable wordle
sudo systemctl restart wordle

echo "✅ Service installed and started"
echo "📝 Don't forget to add the nginx config from nginx-config.txt"
ENDSSH

echo "🎉 Deployment complete!"
echo "🌐 Visit: http://apps.dymitruk.com/wordle"
