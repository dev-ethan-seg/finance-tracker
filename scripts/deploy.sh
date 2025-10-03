#!/bin/bash
set -e

IMAGE_NAME="${1}"
CONTAINER_NAME="finance-tracker"

echo "🚀 Deploying $IMAGE_NAME"

# Backup current container
if docker ps -a | grep -q $CONTAINER_NAME; then
    echo "💾 Creating backup..."
    docker commit $CONTAINER_NAME ${CONTAINER_NAME}-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
fi

# Pull new image
echo "⬇️  Pulling image from Docker Hub..."
docker pull $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull image"
    exit 1
fi

# Stop and remove old container
echo "🛑 Stopping old container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Load environment variables from .env file
if [ -f "$HOME/finance-tracker/.env" ]; then
    echo "📝 Loading environment variables from $HOME/finance-tracker/.env"
    export $(cat $HOME/finance-tracker/.env | grep -v '^#' | xargs)
else
    echo "❌ Error: .env file not found at $HOME/finance-tracker/.env"
    exit 1
fi

# Start new container WITH ENVIRONMENT VARIABLES
echo "▶️  Starting new container..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p 8080:3000 \
  -e AUTH_URL="$AUTH_URL" \
  -e NEXTAUTH_URL="$NEXTAUTH_URL" \
  -e AUTH_TRUST_HOST="$AUTH_TRUST_HOST" \
  -e AUTH_SECRET="$AUTH_SECRET" \
  -e AUTH_DISCORD_ID="$AUTH_DISCORD_ID" \
  -e AUTH_DISCORD_SECRET="$AUTH_DISCORD_SECRET" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NODE_ENV=production \
  $IMAGE_NAME

# Verify it's running
sleep 3
if docker ps | grep -q $CONTAINER_NAME; then
    echo "✅ Deployment successful!"
    docker ps | grep $CONTAINER_NAME
    
    # Cleanup old images (keep last 2)
    echo "🧹 Cleaning up old images..."
    docker images | grep finance-tracker | grep -v backup | tail -n +3 | awk '{print $3}' | xargs -r docker rmi 2>/dev/null || true
else
    echo "❌ Container failed to start!"
    exit 1
fi