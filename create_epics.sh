#!/bin/bash
# Create epic issues

EPICS_DIR="issues/epics"

echo "Creating epic issues..."

for i in {01..13}; do
    # Format EP01, EP02, etc.
    if [ $i -lt 10 ]; then
        EPIC_ID="EP0$i"
    else
        EPIC_ID="EP$i"
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
    
    # Wait to avoid rate limiting
    if [ "$i" -lt 13 ]; then
        sleep 2
    fi
done

echo "Done creating epics!"