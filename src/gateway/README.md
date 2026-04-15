# Stuur Gateway

Telegram bot gateway for the Stuur personal AI assistant.

## S-001: Basic Telegram bot with echo functionality

**Acceptance Criteria:**
- Bot receives message and echoes back
- Deployed on VPS via Docker Compose
- grammY long-polling active

## Quick Start

### 1. Prerequisites
- Node.js 20+ or Docker
- Telegram Bot Token from [@BotFather](https://t.me/botfather)

### 2. Local Development

```bash
cd src/gateway

# Copy environment variables
cp .env.example .env
# Edit .env and add your Telegram bot token

# Install dependencies
npm install

# Start in development mode
npm run dev
```

### 3. Docker Deployment

```bash
# From project root
cd /data/.openclaw/workspace/stuur-project

# Copy environment file
cp src/gateway/.env.example src/gateway/.env
# Edit src/gateway/.env and add your Telegram bot token

# Start with Docker Compose
docker compose up -d

# View logs
docker compose logs -f gateway
```

### 4. Creating a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow instructions
3. Copy the bot token (looks like `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
4. Add token to `.env` file as `TELEGRAM_BOT_TOKEN`

## Project Structure

```
src/gateway/
├── src/
│   ├── index.ts              # Main bot entry point
│   └── utils/
│       └── logger.ts         # Logging utility
├── package.json
├── tsconfig.json
├── Dockerfile
├── .env.example
└── README.md
```

## Features Implemented

### Echo Functionality
- Replies with "Echo: [message]" to any text message
- Includes message ID in reply for context

### Commands
- `/start` - Welcome message
- `/help` - Help information

### Logging
- Structured JSON logging in production
- Pretty logging in development
- Logs user messages (anonymized by ID)
- Error handling with user notifications

### Error Handling
- Graceful shutdown on SIGINT/SIGTERM
- User-friendly error messages
- Bot restart on crash (via Docker Compose)

## Deployment Notes

### VPS Deployment
1. Clone repository to VPS
2. Set up `.env` with bot token
3. Run `docker compose up -d`
4. Monitor with `docker compose logs -f`

### Environment Variables
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
LOG_LEVEL=info
NODE_ENV=production
```

### Health Checks
- Docker healthcheck every 30 seconds
- Automatic restart on failure
- Log rotation via Docker volumes

## Testing

```bash
# Send a message to your bot on Telegram
# It should reply with "Echo: [your message]"

# Check logs
docker compose logs gateway
```

## Next Steps

This implements S-001. Next issues:
- S-002: Graceful error handling and auto-restart (PM2 integration)
- S-003: Fast response time (<2 seconds) optimizations
- S-004: SurrealDB Docker Compose setup

## Troubleshooting

### Bot doesn't respond
1. Check bot token in `.env`
2. Verify Docker container is running: `docker compose ps`
3. Check logs: `docker compose logs gateway`

### Docker build fails
1. Check Docker is installed: `docker --version`
2. Ensure enough disk space
3. Check network connectivity for npm packages

### Rate limiting
- Telegram has rate limits (30 messages/second)
- Implement queue system in future iterations