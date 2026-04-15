#!/bin/bash
# Test script for S-004: SurrealDB Docker Compose setup
# This script verifies that SurrealDB container starts correctly and data persists

set -e

echo "🧪 Testing S-004: SurrealDB Docker Compose setup"
echo "================================================"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

# Use docker compose (v2) if available, otherwise docker-compose (v1)
if command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "✅ Using $DOCKER_COMPOSE"

# Change to project directory
cd "$(dirname "$0")/.."

echo ""
echo "1. Starting services..."
$DOCKER_COMPOSE up -d

echo ""
echo "2. Waiting for services to become healthy..."
sleep 10

# Check if SurrealDB is running
echo ""
echo "3. Checking SurrealDB health..."
if curl -s -f http://localhost:8000/health > /dev/null; then
    echo "✅ SurrealDB health check passed"
else
    echo "❌ SurrealDB health check failed"
    echo "Debug info:"
    $DOCKER_COMPOSE logs surreal
    exit 1
fi

# Check if Gateway is running
echo ""
echo "4. Checking Gateway health..."
if $DOCKER_COMPOSE exec -T gateway node -e "console.log('Healthy')" 2>/dev/null | grep -q Healthy; then
    echo "✅ Gateway health check passed"
else
    echo "⚠️ Gateway health check may have issues"
fi

# Test data persistence
echo ""
echo "5. Testing data persistence..."
# Create a test database entry
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "NS: test" \
  -H "DB: test" \
  -u "root:root" \
  http://localhost:8000/sql \
  -d "CREATE test:persistence SET name = 'test_data', timestamp = time::now();"

# Restart containers
echo ""
echo "6. Restarting containers to test persistence..."
$DOCKER_COMPOSE restart
sleep 5

# Check if data still exists
echo ""
echo "7. Verifying data survived restart..."
RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "NS: test" \
  -H "DB: test" \
  -u "root:root" \
  http://localhost:8000/sql \
  -d "SELECT * FROM test:persistence;")

if echo "$RESULT" | grep -q "test_data"; then
    echo "✅ Data persistence test passed"
else
    echo "❌ Data persistence test failed"
    echo "Response: $RESULT"
    exit 1
fi

echo ""
echo "8. Cleaning up test data..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "NS: test" \
  -H "DB: test" \
  -u "root:root" \
  http://localhost:8000/sql \
  -d "REMOVE test:persistence;"

echo ""
echo "================================================"
echo "🎉 All tests passed! S-004 requirements verified:"
echo "   - SurrealDB container starts with docker compose up"
echo "   - Data survives container restart"
echo "   - Health check endpoint works"
echo ""
echo "You can now use SurrealDB at http://localhost:8000"
echo "Default credentials: root / root"
echo "================================================"

# Optional: leave services running
read -p "Do you want to stop the services? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Stopping services..."
    $DOCKER_COMPOSE down
fi