#!/usr/bin/env python3
"""
Generate all 55 GitHub issues for Stuur project
"""

import os
from datetime import datetime

# Create directories
os.makedirs("issues", exist_ok=True)
os.makedirs("issues/epics", exist_ok=True)

def create_issue(id, epic, title, description, priority, phase, sprint, status, acceptance, notes=""):
    """Create a GitHub issue markdown file"""
    filename = f"issues/{id}.md"
    
    content = f"""# {id}: {title}

**Epic:** {epic}  
**Priority:** {priority}  
**Phase:** {phase}  
**Sprint:** {sprint}  
**Status:** {status}  
**Created:** {datetime.now().strftime('%Y-%m-%d')}

## Description
{description}

## Acceptance Criteria
{acceptance}

## Notes
{notes}

## Implementation Checklist
- [ ] Analyze requirements
- [ ] Design solution
- [ ] Write tests
- [ ] Implement feature
- [ ] Test feature
- [ ] Document feature
- [ ] Deploy to staging
- [ ] Verify in production

## Related Issues
<!-- Link to related issues or epics -->

## Technical Notes
<!-- Add any technical considerations here -->
"""
    
    with open(filename, 'w') as f:
        f.write(content)
    
    print(f"Created: {filename}")
    return filename

def create_epic(id, name, description):
    """Create an epic overview file"""
    filename = f"issues/epics/{id}.md"
    
    content = f"""# {id}: {name}

{description}

## User Stories in this Epic
<!-- List of user story IDs -->

## Phase
<!-- Which development phase -->

## Dependencies
<!-- Other epics or components this depends on -->

## Technical Architecture
<!-- Technical design for this epic -->

## Success Metrics
<!-- How to measure success for this epic -->
"""
    
    with open(filename, 'w') as f:
        f.write(content)
    
    print(f"Created epic: {filename}")

# Create epic overviews
epics = [
    ("EP01", "Gateway & Telegram", "Telegram bot gateway with error handling and fast responses"),
    ("EP02", "SurrealDB & Data Layer", "Database layer with persistence, typed access, and backups"),
    ("EP03", "Identity Core", "User profiling, learning, memory, and personalization"),
    ("EP04", "Intent Router", "Semantic routing for natural language classification"),
    ("EP05", "Ollama / Local LLM (Tier 2)", "Local LLM integration for cost-effective processing"),
    ("EP06", "Claude Integration (Tier 3)", "Cloud LLM integration for complex conversations"),
    ("EP07", "Smart Reminders", "Natural language reminders with smart defaults"),
    ("EP08", "Google Calendar", "Calendar integration for event management"),
    ("EP09", "Expense Tracker", "Spending tracking with auto-categorization"),
    ("EP10", "Personal CRM", "Contact management and relationship tracking"),
    ("EP11", "Goal Tracker", "Goal setting and progress tracking"),
    ("EP12", "Hardening & Open Source", "Production readiness and open source setup"),
    ("EP13", "Growth & Monetization", "Scaling, monetization, and multi-channel support"),
]

for epic_id, epic_name, epic_desc in epics:
    create_epic(epic_id, epic_name, epic_desc)

# Create all user stories
user_stories = [
    # EP01: Gateway & Telegram (3 stories)
    ("S-001", "EP01: Gateway & Telegram", "Basic Telegram bot with echo functionality",
     "As a user, I want to send a message on Telegram and get a response from Stuur so that I can interact with my assistant via chat",
     "Must Have", "Phase 1: Foundation", "W1-2", "Backlog",
     "Bot receives message and echoes back; deployed on VPS via Docker Compose; grammY long-polling active",
     "Foundation — everything builds on this"),
    
    ("S-002", "EP01: Gateway & Telegram", "Graceful error handling and auto-restart",
     "As a user, I want Stuur to handle errors gracefully so that the bot never silently crashes",
     "Must Have", "Phase 1: Foundation", "W1-2", "Backlog",
     "PM2 auto-restarts on crash; error logged to file; user gets friendly 'even geduld' message on failure",
     ""),
    
    ("S-003", "EP01: Gateway & Telegram", "Fast response time (<2 seconds) for simple messages",
     "As a user, I want Stuur to respond in under 2 seconds for simple messages so that it feels instant",
     "Must Have", "Phase 1: Foundation", "W1-2", "Backlog",
     "Average response time <2s for Tier 1 messages measured over 100 test messages",
     ""),
    
    # EP02: SurrealDB & Data Layer (3 stories)
    ("S-004", "EP02: SurrealDB & Data Layer", "SurrealDB Docker Compose setup",
     "As a developer, I want SurrealDB running in Docker Compose alongside the gateway so that all data is persisted properly",
     "Must Have", "Phase 1: Foundation", "W3-4", "Backlog",
     "SurrealDB container starts with docker compose up; data survives container restart; health check endpoint works",
     ""),
    
    ("S-005", "EP02: SurrealDB & Data Layer", "Typed data access layer for SurrealDB",
     "As a developer, I want a typed data access layer for SurrealDB so that all modules use consistent CRUD operations",
     "Must Have", "Phase 1: Foundation", "W3-4", "Backlog",
     "TypeScript functions for create/read/update/delete on all core tables; connection pooling; error handling",
     ""),
    
    ("S-006", "EP02: SurrealDB & Data Layer", "Automated daily backups of SurrealDB",
     "As a developer, I want automated daily backups of SurrealDB so that no data is ever lost",
     "Should Have", "Phase 1: Foundation", "W3-4", "Backlog",
     "Cron job exports SurrealQL dump daily; stored locally + option for remote backup; restore tested",
     ""),
    
    # EP03: Identity Core — Onboarding (3 stories)
    ("S-007", "EP03: Identity Core — Onboarding", "Natural onboarding conversation",
     "As a new user, I want a natural onboarding conversation when I first use Stuur so that it learns who I am without filling in forms",
     "Must Have", "Phase 1: Foundation", "W3-4", "Backlog",
     "Bot asks name, language, timezone, primary use case in conversational flow; stores in user_profile; completes in <2 minutes",
     ""),
    
    ("S-008", "EP03: Identity Core — Onboarding", "Remember preferred language (NL/EN)",
     "As a user, I want Stuur to remember my preferred language (NL/EN) so that it always responds in the right language",
     "Must Have", "Phase 1: Foundation", "W3-4", "Backlog",
     "Language detected from onboarding; stored in profile; all responses match preference; switches when user switches",
     ""),
    
    ("S-009", "EP03: Identity Core — Onboarding", "Timezone awareness for all datetime operations",
     "As a user, I want Stuur to know my timezone so that all times in reminders and calendar are correct",
     "Must Have", "Phase 1: Foundation", "W3-4", "Backlog",
     "Timezone set during onboarding; all datetime operations use user TZ; displayed times always local",
     ""),
    
    # EP03: Identity Core — User Profile (3 stories)
    ("S-010", "EP03: Identity Core — User Profile", "Build user profile over time",
     "As a user, I want Stuur to build a profile about me over time so that it gets better at helping me",
     "Must Have", "Phase 1: Foundation", "W7-8", "Backlog",
     "Profile stores facts with confidence scores; facts accumulate from conversations; profile queryable via SurrealDB",
     ""),
    
    ("S-011", "EP03: Identity Core — User Profile", "Profile summary query",
     "As a user, I want to ask Stuur 'what do you know about me' and get a clear summary so that I can see what it has learned",
     "Should Have", "Phase 1: Foundation", "W7-8", "Backlog",
     "Returns categorized summary of semantic facts, known contacts, active goals, preferences; in user's language",
     ""),
    
    ("S-012", "EP03: Identity Core — User Profile", "Profile correction mechanism",
     "As a user, I want to correct Stuur when it gets something wrong about me so that my profile stays accurate",
     "Must Have", "Phase 1: Foundation", "W7-8", "Backlog",
     "User says 'nee ik woon niet meer in Utrecht' → old fact invalidated, new fact stored with high confidence; correction acknowledged",
     ""),
    
    # EP03: Identity Core — Learning Loop (3 stories)
    ("S-013", "EP03: Identity Core — Learning Loop", "Automatic fact extraction from conversations",
     "As a user, I want Stuur to extract facts from our conversations automatically so that I never have to repeat myself",
     "Must Have", "Phase 1: Foundation", "W7-8", "Backlog",
     "Fact extraction runs on local model after substantive messages; new facts stored with confidence 0.5-1.0 based on source; duplicates merged",
     ""),
    
    ("S-014", "EP03: Identity Core — Learning Loop", "Fact decay over time",
     "As a user, I want old facts to decay over time if never confirmed so that my profile doesn't fill with stale info",
     "Should Have", "Phase 1: Foundation", "W7-8", "Backlog",
     "Facts not confirmed in 90 days lose 0.05/month; below 0.3 archived; event-linked facts expire after event date",
     ""),
    
    ("S-015", "EP03: Identity Core — Learning Loop", "Learn response preferences from user reactions",
     "As a user, I want Stuur to learn how I prefer responses (brief vs detailed) by watching my reactions so that it adapts to my style",
     "Should Have", "Phase 1: Foundation", "W7-8", "Backlog",
     "Procedural rules created after 3+ consistent corrections; tone/verbosity preference auto-adjusts; stored as procedure_rules",
     ""),
    
    # EP03: Identity Core — Episodic Memory (1 story)
    ("S-016", "EP03: Identity Core — Episodic Memory", "Daily conversation compression into summaries",
     "As a user, I want Stuur to compress daily conversations into summaries so that it remembers context without storing everything",
     "Should Have", "Phase 2: Core Features", "W15-16", "Backlog",
     "End-of-day cron compresses conversation into episode with summary, entities, mood; older episodes further compressed weekly→monthly",
     ""),
    
    # EP03: Identity Core — Monthly Check-in (1 story)
    ("S-017", "EP03: Identity Core — Monthly Check-in", "Monthly check-in for feedback",
     "As a user, I want Stuur to send a monthly check-in asking how it's doing so that I can give feedback and correct its behavior",
     "Nice to Have", "Phase 3: Polish", "W17-18", "Backlog",
     "Monthly message with usage stats, learned preferences summary, open question for feedback; responses update procedural rules with highest confidence",
     ""),
    
    # EP04: Intent Router (4 stories)
    ("S-018", "EP04: Intent Router", "Natural language interaction without slash commands",
     "As a user, I want to talk naturally without slash commands so that using Stuur feels like texting a friend",
     "Must Have", "Phase 1: Foundation", "W5-6", "Backlog",
     "No slash commands exist; all interactions via natural language; Semantic Router classifies intent from message text",
     ""),
    
    ("S-019", "EP04: Intent Router", "Semantic Router with 10+ predefined routes",
     "As a developer, I want a Semantic Router with 10+ predefined routes so that common actions are handled without any LLM call",
     "Must Have", "Phase 1: Foundation", "W5-6", "Backlog",
     "Routes for: create_reminder, check_calendar, log_expense, greeting, help, check_expenses, create_goal, contact_lookup, daily_briefing, general_chat; <5ms classification",
     ""),
    
    ("S-020", "EP04: Intent Router", "Fallback to local LLM for ambiguous messages",
     "As a developer, I want the router to fall back to the local LLM for ambiguous messages so that nothing gets misclassified silently",
     "Must Have", "Phase 1: Foundation", "W5-6", "Backlog",
     "If Semantic Router confidence < threshold → Qwen classifies with user context; if Qwen unsure → escalate to Tier 3",
     ""),
    
    ("S-021", "EP04: Intent Router", "Usage pattern biased classification",
     "As a developer, I want the router to use the user's usage patterns to bias classification so that heavy calendar users get calendar-biased routing",
     "Nice to Have", "Phase 2: Core Features", "W15-16", "Backlog",
     "Module usage frequency from profile weights Semantic Router scores; A/B tested against unbiased routing",
     ""),
    
    # EP05: Ollama / Local LLM (Tier 2) (3 stories)
    ("S-022", "EP05: Ollama / Local LLM (Tier 2)", "Ollama Docker setup with Qwen 3.5 0.8B",
     "As a developer, I want Ollama running in Docker Compose with Qwen 3.5 0.8B so that ambiguous messages are handled locally for free",
     "Must Have", "Phase 1: Foundation", "W7-8", "Backlog",
     "Ollama container with Qwen model starts with docker compose up; responds to API calls; structured JSON output works; RAM usage <2GB",
     ""),
    
    ("S-023", "EP05: Ollama / Local LLM (Tier 2)", "Personalized system prompt from Identity Core",
     "As a developer, I want the local model to receive a personalized system prompt from the Identity Core so that responses are contextual",
     "Must Have", "Phase 1: Foundation", "W7-8", "Backlog",
     "System prompt includes: user name, language, timezone, tone preference, recent context; prompt <150 tokens",
     ""),
    
    ("S-024", "EP05: Ollama / Local LLM (Tier 2)", "Graceful fallback to Claude if Ollama is down",
     "As a developer, I want graceful fallback to Claude if Ollama is down or slow so that the user never notices infrastructure issues",
     "Should Have", "Phase 2: Core Features", "W15-16", "Backlog",
     "If Ollama timeout >5s or connection refused → route to Claude Haiku; user sees no error; incident logged",
     ""),
    
    # EP06: Claude Integration (Tier 3) (2 stories)
    ("S-025", "EP06: Claude Integration (Tier 3)", "Complex conversations handled by Claude",
     "As a user, I want complex conversations handled by Claude so that I get thoughtful answers for planning and advice",
     "Must Have", "Phase 2: Core Features", "W15-16", "Backlog",
     "Messages classified as complex → sent to Claude Haiku with full Identity Core context; conversation memory included; response time <5s",
     ""),
    
    ("S-026", "EP06: Claude Integration (Tier 3)", "API cost tracking per user",
     "As a developer, I want API cost tracking per user so that I can monitor and cap cloud LLM spending",
     "Must Have", "Phase 2: Core Features", "W15-16", "Backlog",
     "Every Claude call logged with token count and estimated cost; daily/monthly totals queryable; alert at configurable threshold",
     ""),
    
    # EP07: Smart Reminders (5 stories)
    ("S-027", "EP07: Smart Reminders", "Create reminders by natural language",
     "As a user, I want to create reminders by just saying 'herinner me aan X' so that I never need to open another app",
     "Must Have", "Phase 2: Core Features", "W11-12", "Backlog",
     "Natural language parsed into reminder with title + due_at; stored in SurrealDB; confirmation sent in <2s",
     ""),
    
    ("S-028", "EP07: Smart Reminders", "Smart default reminder timing based on context",
     "As a user, I want Stuur to pick smart default reminder timing based on context so that medical appointments get day-before reminders and meetings get 30-min reminders",
     "Must Have", "Phase 2: Core Features", "W11-12", "Backlog",
     "Category detection (medical, work, social, personal); default timing per category from procedural rules; user can override",
     ""),
    
    ("S-029", "EP07: Smart Reminders", "Snooze reminders with inline buttons or text",
     "As a user, I want to snooze a reminder by replying 'later' or '1 uur' so that I can defer without losing it",
     "Should Have", "Phase 2: Core Features", "W11-12", "Backlog",
     "Telegram inline buttons for snooze (15m, 1h, 3h, tomorrow); text reply also works ('later' = +1h, specific time parsed)",
