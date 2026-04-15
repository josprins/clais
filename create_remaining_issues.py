#!/usr/bin/env python3
import os
import time
import subprocess
import re

# Get existing issues
print("Fetching existing issues...")
result = subprocess.run(
    ['gh', 'issue', 'list', '--limit', '100', '--json', 'title'],
    capture_output=True,
    text=True,
    check=True
)

# Parse existing issue IDs
import json
existing_data = json.loads(result.stdout)
existing_ids = set()
for issue in existing_data:
    # Extract S-XXX from title
    match = re.search(r'S-\d+', issue['title'])
    if match:
        existing_ids.add(match.group(0))

print(f"Found {len(existing_ids)} existing issues: {sorted(existing_ids)}")

# Get all issue files
issues_dir = 'issues'
all_files = sorted([f for f in os.listdir(issues_dir) if f.startswith('S-') and f.endswith('.md')])
print(f"Total issue files: {len(all_files)}")

# Filter out existing issues
files_to_create = []
for f in all_files:
    issue_id = f.replace('.md', '')
    if issue_id not in existing_ids:
        files_to_create.append(f)

print(f"Need to create {len(files_to_create)} issues: {[f.replace('.md', '') for f in files_to_create]}")

# Create remaining issues
for i, issue_file in enumerate(files_to_create):
    filepath = os.path.join(issues_dir, issue_file)
    issue_id = issue_file.replace('.md', '')
    
    # Read the file
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extract title (first line, remove #)
    lines = content.split('\n')
    title = lines[0].replace('# ', '', 1).strip()
    
    print(f'Creating issue {i+1}/{len(files_to_create)}: {title[:60]}...')
    
    # Create issue
    try:
        result = subprocess.run(
            ['gh', 'issue', 'create', '--title', title, '--body', content],
            capture_output=True,
            text=True,
            check=True
        )
        print(f'  ✓ Created: {result.stdout.strip()}')
    except subprocess.CalledProcessError as e:
        print(f'  ✗ Error creating {issue_id}: {e.stderr}')
        # If it's a rate limit error, wait longer
        if 'rate limit' in e.stderr.lower():
            print('  ⏳ Rate limit hit, waiting 30 seconds...')
            time.sleep(30)
            # Retry once
            try:
                result = subprocess.run(
                    ['gh', 'issue', 'create', '--title', title, '--body', content],
                    capture_output=True,
                    text=True,
                    check=True
                )
                print(f'  ✓ Created on retry: {result.stdout.strip()}')
            except subprocess.CalledProcessError as e2:
                print(f'  ✗ Failed again: {e2.stderr}')
                break
    
    # Delay to avoid rate limiting (except after last)
    if i < len(files_to_create) - 1:
        time.sleep(2)

print('Done!')