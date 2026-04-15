#!/bin/bash
# Create remaining issues S-024 to S-055

ISSUES_DIR="issues"

echo "Creating remaining issues..."

for i in {024..055}; do
    ISSUE_ID="S-$i"
    FILE="$ISSUES_DIR/$ISSUE_ID.md"
    
    if [ ! -f "$FILE" ]; then
        echo "File $FILE not found, skipping"
        continue
    fi
    
    # Check if issue already exists
    if gh issue list --search "$ISSUE_ID" --limit 1 | grep -q "$ISSUE_ID"; then
        echo "Issue $ISSUE_ID already exists, skipping"
        continue
    fi
    
    # Read title and body
    TITLE=$(head -n 1 "$FILE" | sed 's/^# //')
    BODY=$(cat "$FILE")
    
    echo "Creating $ISSUE_ID: ${TITLE:0:50}..."
    
    # Create issue
    gh issue create --title "$TITLE" --body "$BODY"
    
    # Wait to avoid rate limiting
    if [ "$i" -lt 55 ]; then
        sleep 2
    fi
done

echo "Done!"