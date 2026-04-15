#!/bin/bash
# Test script to create one GitHub issue

ISSUE_FILE="issues/S-001.md"
TITLE="S-001: Basic Telegram bot with echo functionality"
BODY=$(cat "$ISSUE_FILE")

echo "Creating test issue: $TITLE"
echo "Body length: ${#BODY} characters"

# Create issue using GitHub CLI
gh issue create --title "$TITLE" --body "$BODY" --label "priority:must-have" --label "epic:ep01" --label "phase:1"