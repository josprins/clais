#!/bin/bash
# Deployment script for Stuur project

set -e

echo "🚀 Stuur Deployment Script"
echo "=========================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

# Check for .env file
if [ ! -f "src/gateway/.env" ]; then
    echo "⚠️  No .env file found. Creating from example..."
    if [ -f "src/gateway/.env.example" ]; then
        cp src/gateway/.env.example src/gateway/.env
        echo "📝 Please edit src/gateway/.env and add your Telegram bot token"
        echo "   Get a token from @BotFather on Telegram"
        exit 1
    else
        echo "❌ No .env.example file found. Cannot create .env"
        exit 1
    fi
fi

# Check if Telegram bot token is set
if grep -q "your_bot_token_here" src/gateway/.env; then
    echo "❌ Please update src/gateway/.env with your Telegram bot token"
    echo "   Get a token from @BotFather on Telegram"
    exit 1
fi

echo "✅ All prerequisites checked"

# Build and start services
echo "🔨 Building and starting Docker containers..."
docker compose build --no-cache
docker compose up -d

echo "📊 Checking service status..."
docker compose ps

echo "🔍 Checking SurrealDB health..."
sleep 5
if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ SurrealDB is healthy"
else
    echo "⚠️  SurrealDB health check failed (might still be starting)"
    echo "   Check logs with: docker compose logs surreal"
fi

echo "📝 View logs with: docker compose logs -f gateway"
echo "📝 View SurrealDB logs: docker compose logs surreal"
echo "🛑 Stop services with: docker compose down"
echo ""
echo "✅ Deployment complete! Your Stuur bot should now be running."
echo ""
echo "Next steps:"
echo "1. Open Telegram and search for your bot"
echo "2. Send /start to begin"
echo "3. Send any message to test echo functionality"
echo "4. Access SurrealDB at http://localhost:8000 (credentials: root/root)"
echo ""
echo "Monitor logs: docker compose logs -f gateway"
echo "Test SurrealDB: curl http://localhost:8000/health"
echo "Run full test suite: ./scripts/test-surrealdb.sh"