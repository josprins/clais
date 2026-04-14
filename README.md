# Stuur - Personal AI Assistant

Stuur is a personal AI assistant that lives in your messaging apps (Telegram, WhatsApp) and helps you manage your life through natural conversation.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/stuur.git
cd stuur

# Start with Docker Compose
docker compose up
```

## 📋 Project Status

**Phase 1 (Foundation):** Weeks 1-8  
**Phase 2 (Core Features):** Weeks 9-16  
**Phase 3 (Polish):** Weeks 17-24  
**Phase 4 (Growth):** Weeks 25-50

## 🏗️ Architecture

### Three-Tier LLM System
- **Tier 1**: Semantic Router (fast, rule-based classification)
- **Tier 2**: Local LLM (Ollama with Qwen 3.5 0.8B)
- **Tier 3**: Cloud LLM (Claude Haiku for complex tasks)

### Core Components
1. **Gateway & Telegram** - Messaging interface using grammY
2. **SurrealDB & Data Layer** - Graph database for persistent storage
3. **Identity Core** - User profiling, learning, and memory
4. **Intent Router** - Semantic routing for natural language
5. **Ollama / Local LLM** - Qwen 3.5 0.8B for local processing
6. **Claude Integration** - Claude Haiku for complex conversations
7. **Smart Reminders** - Natural language reminders
8. **Google Calendar** - Calendar integration
9. **Expense Tracker** - Spending tracking
10. **Personal CRM** - Contact management
11. **Goal Tracker** - Goal setting and tracking

## 📁 Project Structure

```
stuur/
├── src/                    # Source code
│   ├── gateway/           # Telegram bot (grammY)
│   ├── database/          # SurrealDB client and models
│   ├── identity/          # User profiling and learning
│   ├── router/            # Intent classification
│   ├── llm/               # LLM integrations (Ollama, Claude)
│   ├── modules/           # Feature modules (reminders, calendar, etc.)
│   └── utils/             # Utilities and helpers
├── docker-compose.yml     # Docker setup
├── Dockerfile             # Gateway Dockerfile
├── .env.example          # Environment variables
└── README.md             # This file
```

## 🎯 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for development)
- Telegram Bot Token
- Anthropic API Key (for Claude)
- Google Cloud credentials (for Calendar)

### Development Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/stuur.git
cd stuur

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# 3. Start services
docker compose up -d

# 4. Access logs
docker compose logs -f gateway
```

## 📊 Issue Tracking

This project uses GitHub Issues for tracking development. All 55 user stories are documented as issues:

- **Total Issues:** 55 user stories
- **Epics:** 13 major feature groups
- **Phases:** 4 development phases

### Key Issues for Phase 1 (Weeks 1-2)
1. [#S-001](issues/S-001.md) - Basic Telegram bot with echo functionality
2. [#S-002](issues/S-002.md) - Graceful error handling and auto-restart
3. [#S-003](issues/S-003.md) - Fast response time (<2 seconds)

## 🛠️ Development

### Technology Stack
- **Backend:** TypeScript, Node.js
- **Database:** SurrealDB (graph database)
- **Messaging:** grammY (Telegram Bot API)
- **LLM Local:** Ollama with Qwen 3.5 0.8B
- **LLM Cloud:** Anthropic Claude Haiku
- **Containerization:** Docker & Docker Compose
- **Monitoring:** PM2 for process management

### Code Style
- TypeScript with strict type checking
- ESLint for code quality
- Prettier for code formatting
- Conventional commits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [grammY](https://grammy.dev/) - Telegram Bot Framework
- [SurrealDB](https://surrealdb.com/) - Graph Database
- [Ollama](https://ollama.ai/) - Local LLM Runner
- [Anthropic Claude](https://www.anthropic.com/) - AI Assistant

---

**Stuur** - Your personal assistant, always there to help. 🤖