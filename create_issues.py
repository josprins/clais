#!/usr/bin/env python3
"""
Convert Stuur User Stories to GitHub Issues
This script creates markdown files for each user story that can be imported as GitHub issues.
"""

import os
import json
from datetime import datetime

# Define the user stories data structure
user_stories = [
    # EP01: Gateway & Telegram
    {
        "id": "S-001",
        "epic": "EP01: Gateway & Telegram",
        "title": "Basic Telegram bot with echo functionality",
        "description": "As a user, I want to send a message on Telegram and get a response from Stuur so that I can interact with my assistant via chat",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W1-2",
        "status": "Backlog",
        "acceptance_criteria": "Bot receives message and echoes back; deployed on VPS via Docker Compose; grammY long-polling active",
        "notes": "Foundation — everything builds on this"
    },
    {
        "id": "S-002",
        "epic": "EP01: Gateway & Telegram",
        "title": "Graceful error handling and auto-restart",
        "description": "As a user, I want Stuur to handle errors gracefully so that the bot never silently crashes",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W1-2",
        "status": "Backlog",
        "acceptance_criteria": "PM2 auto-restarts on crash; error logged to file; user gets friendly 'even geduld' message on failure",
        "notes": ""
    },
    {
        "id": "S-003",
        "epic": "EP01: Gateway & Telegram",
        "title": "Fast response time (<2 seconds) for simple messages",
        "description": "As a user, I want Stuur to respond in under 2 seconds for simple messages so that it feels instant",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W1-2",
        "status": "Backlog",
        "acceptance_criteria": "Average response time <2s for Tier 1 messages measured over 100 test messages",
        "notes": ""
    },
    # EP02: SurrealDB & Data Layer
    {
        "id": "S-004",
        "epic": "EP02: SurrealDB & Data Layer",
        "title": "SurrealDB Docker Compose setup",
        "description": "As a developer, I want SurrealDB running in Docker Compose alongside the gateway so that all data is persisted properly",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W3-4",
        "status": "Backlog",
        "acceptance_criteria": "SurrealDB container starts with docker compose up; data survives container restart; health check endpoint works",
        "notes": ""
    },
    {
        "id": "S-005",
        "epic": "EP02: SurrealDB & Data Layer",
        "title": "Typed data access layer for SurrealDB",
        "description": "As a developer, I want a typed data access layer for SurrealDB so that all modules use consistent CRUD operations",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W3-4",
        "status": "Backlog",
        "acceptance_criteria": "TypeScript functions for create/read/update/delete on all core tables; connection pooling; error handling",
        "notes": ""
    },
    {
        "id": "S-006",
        "epic": "EP02: SurrealDB & Data Layer",
        "title": "Automated daily backups of SurrealDB",
        "description": "As a developer, I want automated daily backups of SurrealDB so that no data is ever lost",
        "priority": "Should Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W3-4",
        "status": "Backlog",
        "acceptance_criteria": "Cron job exports SurrealQL dump daily; stored locally + option for remote backup; restore tested",
        "notes": ""
    },
    # EP03: Identity Core — Onboarding
    {
        "id": "S-007",
        "epic": "EP03: Identity Core — Onboarding",
        "title": "Natural onboarding conversation",
        "description": "As a new user, I want a natural onboarding conversation when I first use Stuur so that it learns who I am without filling in forms",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W3-4",
        "status": "Backlog",
        "acceptance_criteria": "Bot asks name, language, timezone, primary use case in conversational flow; stores in user_profile; completes in <2 minutes",
        "notes": ""
    },
    {
        "id": "S-008",
        "epic": "EP03: Identity Core — Onboarding",
        "title": "Remember preferred language (NL/EN)",
        "description": "As a user, I want Stuur to remember my preferred language (NL/EN) so that it always responds in the right language",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W3-4",
        "status": "Backlog",
        "acceptance_criteria": "Language detected from onboarding; stored in profile; all responses match preference; switches when user switches",
        "notes": ""
    },
    {
        "id": "S-009",
        "epic": "EP03: Identity Core — Onboarding",
        "title": "Timezone awareness for all datetime operations",
        "description": "As a user, I want Stuur to know my timezone so that all times in reminders and calendar are correct",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W3-4",
        "status": "Backlog",
        "acceptance_criteria": "Timezone set during onboarding; all datetime operations use user TZ; displayed times always local",
        "notes": ""
    },
    # EP03: Identity Core — User Profile
    {
        "id": "S-010",
        "epic": "EP03: Identity Core — User Profile",
        "title": "Build user profile over time",
        "description": "As a user, I want Stuur to build a profile about me over time so that it gets better at helping me",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W7-8",
        "status": "Backlog",
        "acceptance_criteria": "Profile stores facts with confidence scores; facts accumulate from conversations; profile queryable via SurrealDB",
        "notes": ""
    },
    {
        "id": "S-011",
        "epic": "EP03: Identity Core — User Profile",
        "title": "Profile summary query",
        "description": "As a user, I want to ask Stuur 'what do you know about me' and get a clear summary so that I can see what it has learned",
        "priority": "Should Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W7-8",
        "status": "Backlog",
        "acceptance_criteria": "Returns categorized summary of semantic facts, known contacts, active goals, preferences; in user's language",
        "notes": ""
    },
    {
        "id": "S-012",
        "epic": "EP03: Identity Core — User Profile",
        "title": "Profile correction mechanism",
        "description": "As a user, I want to correct Stuur when it gets something wrong about me so that my profile stays accurate",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W7-8",
        "status": "Backlog",
        "acceptance_criteria": "User says 'nee ik woon niet meer in Utrecht' → old fact invalidated, new fact stored with high confidence; correction acknowledged",
        "notes": ""
    },
    # EP03: Identity Core — Learning Loop
    {
        "id": "S-013",
        "epic": "EP03: Identity Core — Learning Loop",
        "title": "Automatic fact extraction from conversations",
        "description": "As a user, I want Stuur to extract facts from our conversations automatically so that I never have to repeat myself",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W7-8",
        "status": "Backlog",
        "acceptance_criteria": "Fact extraction runs on local model after substantive messages; new facts stored with confidence 0.5-1.0 based on source; duplicates merged",
        "notes": ""
    },
    {
        "id": "S-014",
        "epic": "EP03: Identity Core — Learning Loop",
        "title": "Fact decay over time",
        "description": "As a user, I want old facts to decay over time if never confirmed so that my profile doesn't fill with stale info",
        "priority": "Should Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W7-8",
        "status": "Backlog",
        "acceptance_criteria": "Facts not confirmed in 90 days lose 0.05/month; below 0.3 archived; event-linked facts expire after event date",
        "notes": ""
    },
    {
        "id": "S-015",
        "epic": "EP03: Identity Core — Learning Loop",
        "title": "Learn response preferences from user reactions",
        "description": "As a user, I want Stuur to learn how I prefer responses (brief vs detailed) by watching my reactions so that it adapts to my style",
        "priority": "Should Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W7-8",
        "status": "Backlog",
        "acceptance_criteria": "Procedural rules created after 3+ consistent corrections; tone/verbosity preference auto-adjusts; stored as procedure_rules",
        "notes": ""
    },
    # EP03: Identity Core — Episodic Memory
    {
        "id": "S-016",
        "epic": "EP03: Identity Core — Episodic Memory",
        "title": "Daily conversation compression into summaries",
        "description": "As a user, I want Stuur to compress daily conversations into summaries so that it remembers context without storing everything",
        "priority": "Should Have",
        "phase": "Phase 2: Core Features",
        "sprint": "W15-16",
        "status": "Backlog",
        "acceptance_criteria": "End-of-day cron compresses conversation into episode with summary, entities, mood; older episodes further compressed weekly→monthly",
        "notes": ""
    },
    {
        "id": "S-017",
        "epic": "EP03: Identity Core — Monthly Check-in",
        "title": "Monthly check-in for feedback",
        "description": "As a user, I want Stuur to send a monthly check-in asking how it's doing so that I can give feedback and correct its behavior",
        "priority": "Nice to Have",
        "phase": "Phase 3: Polish",
        "sprint": "W17-18",
        "status": "Backlog",
        "acceptance_criteria": "Monthly message with usage stats, learned preferences summary, open question for feedback; responses update procedural rules with highest confidence",
        "notes": ""
    },
    # EP04: Intent Router
    {
        "id": "S-018",
        "epic": "EP04: Intent Router",
        "title": "Natural language interaction without slash commands",
        "description": "As a user, I want to talk naturally without slash commands so that using Stuur feels like texting a friend",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W5-6",
        "status": "Backlog",
        "acceptance_criteria": "No slash commands exist; all interactions via natural language; Semantic Router classifies intent from message text",
        "notes": ""
    },
    {
        "id": "S-019",
        "epic": "EP04: Intent Router",
        "title": "Semantic Router with 10+ predefined routes",
        "description": "As a developer, I want a Semantic Router with 10+ predefined routes so that common actions are handled without any LLM call",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W5-6",
        "status": "Backlog",
        "acceptance_criteria": "Routes for: create_reminder, check_calendar, log_expense, greeting, help, check_expenses, create_goal, contact_lookup, daily_briefing, general_chat; <5ms classification",
        "notes": ""
    },
    {
        "id": "S-020",
        "epic": "EP04: Intent Router",
        "title": "Fallback to local LLM for ambiguous messages",
        "description": "As a developer, I want the router to fall back to the local LLM for ambiguous messages so that nothing gets misclassified silently",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W5-6",
        "status": "Backlog",
        "acceptance_criteria": "If Semantic Router confidence < threshold → Qwen classifies with user context; if Qwen unsure → escalate to Tier 3",
        "notes": ""
    },
    {
        "id": "S-021",
        "epic": "EP04: Intent Router",
        "title": "Usage pattern biased classification",
        "description": "As a developer, I want the router to use the user's usage patterns to bias classification so that heavy calendar users get calendar-biased routing",
        "priority": "Nice to Have",
        "phase": "Phase 2: Core Features",
        "sprint": "W15-16",
        "status": "Backlog",
        "acceptance_criteria": "Module usage frequency from profile weights Semantic Router scores; A/B tested against unbiased routing",
        "notes": ""
    },
    # EP05: Ollama / Local LLM (Tier 2)
    {
        "id": "S-022",
        "epic": "EP05: Ollama / Local LLM (Tier 2)",
        "title": "Ollama Docker setup with Qwen 3.5 0.8B",
        "description": "As a developer, I want Ollama running in Docker Compose with Qwen 3.5 0.8B so that ambiguous messages are handled locally for free",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W7-8",
        "status": "Backlog",
        "acceptance_criteria": "Ollama container with Qwen model starts with docker compose up; responds to API calls; structured JSON output works; RAM usage <2GB",
        "notes": ""
    },
    {
        "id": "S-023",
        "epic": "EP05: Ollama / Local LLM (Tier 2)",
        "title": "Personalized system prompt from Identity Core",
        "description": "As a developer, I want the local model to receive a personalized system prompt from the Identity Core so that responses are contextual",
        "priority": "Must Have",
        "phase": "Phase 1: Foundation",
        "sprint": "W7-8",
        "status": "Backlog",
        "acceptance_criteria": "System prompt includes: user name, language, timezone, tone preference, recent context; prompt <150 tokens",
        "notes": ""
    },
    {
        "id": "S-024",
        "epic": "EP05: Ollama / Local LLM (Tier 2)",
        "title": "Graceful fallback to Claude if Ollama is down",
        "description": "As a developer, I want graceful fallback to Claude if Ollama is down or slow so that the user never notices infrastructure issues",
        "priority": "Should Have",
        "phase": "Phase 2: Core Features",
        "sprint": "W15-16",
        "status": "Backlog",
        "acceptance_criteria": "If Ollama timeout >5s or connection refused → route to Claude Haiku; user sees no error; incident logged",
        "notes": ""
    },
    # EP06: Claude Integration (Tier 3)
    {
        "id": "S-025",
        "epic": "EP06: Claude Integration (Tier 3)",
        "title": "Complex conversations handled by Claude",
        "description": "As a user, I want complex conversations handled by Claude so that I get thoughtful answers for planning and advice",
        "priority": "Must Have",
        "phase": "Phase 2: Core Features",
        "sprint": "W15-16",
        "status": "Backlog",
        "acceptance_criteria": "Messages classified as complex → sent to Claude Haiku with full Identity Core context; conversation memory included; response time <5s",
        "notes": ""
    },
    {
        "id": "S-026",
        "epic": "EP06: Claude Integration (Tier 3)",
        "title": "API cost tracking per user",
        "description": "As a developer, I want API cost tracking per user so that I can monitor and cap cloud LLM spending",
        "priority": "Must Have",
        "phase": "Phase 2: Core Features",
        "sprint": "W15-16",
        "status": "Backlog",
        "acceptance_criteria": "Every Claude call logged with token count and estimated cost; daily/monthly totals queryable; alert at configurable threshold",
        "notes":