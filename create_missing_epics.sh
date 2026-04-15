#!/bin/bash
# Create missing epic issues EP01 to EP09

EPICS_DIR="issues/epics"

echo "Creating missing epic issues..."

for i in {01..09}; do
    EPIC_ID="EP$i"
    
    # Check if already exists
    if gh issue list --search "$EPIC_ID" --limit 1 | grep -q "$EPIC_ID"; then
        echo "Epic $EPIC_ID already exists, skipping"
        continue
    fi
    
    FILE="$EPICS_DIR/$EPIC_ID.md"
    
    if [ ! -f "$FILE" ]; then
        echo "File $FILE not found, skipping"
        continue
    fi
    
    # Read title and body
    TITLE=$(head -n 1 "$FILE" | sed 's/^# //')
    BODY=$(cat "$FILE")
    
    echo "Creating $EPIC_ID: ${TITLE:0:50}..."
    
    # Create issue with epic label
    gh issue create --title "$TITLE" --body "$BODY" --label "epic"
    
    # Wait longer to avoid rate limiting
    if [ "$i" -lt 9 ]; then
        echo "Waiting 5 seconds..."
        sleep 5
    fi
done

echo "Done creating missing epics!"