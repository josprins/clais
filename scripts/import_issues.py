#!/usr/bin/env python3
"""
Script to import Stuur issues to GitHub using GitHub CLI (gh)

Prerequisites:
1. Install GitHub CLI: https://cli.github.com/
2. Authenticate: gh auth login
3. Create repository: gh repo create stuur --public --push --source=.

Usage:
python3 scripts/import_issues.py
"""

import os
import subprocess
import json
import re
from pathlib import Path

def parse_issue_file(filepath):
    """Parse a markdown issue file and extract metadata"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extract metadata from the markdown
    metadata = {}
    lines = content.split('\n')
    
    for line in lines:
        if line.startswith('**Epic:**'):
            metadata['epic'] = line.replace('**Epic:**', '').strip()
        elif line.startswith('**Priority:**'):
            metadata['priority'] = line.replace('**Priority:**', '').strip()
        elif line.startswith('**Phase:**'):
            metadata['phase'] = line.replace('**Phase:**', '').strip()
        elif line.startswith('**Sprint:**'):
            metadata['sprint'] = line.replace('**Sprint:**', '').strip()
        elif line.startswith('**Status:**'):
            metadata['status'] = line.replace('**Status:**', '').strip()
    
    # Extract title (first line after #)
    title_match = re.match(r'# (.+?): (.+)', lines[0])
    if title_match:
        metadata['id'] = title_match.group(1)
        metadata['title'] = title_match.group(2)
    
    # The rest is the body
    metadata['body'] = content
    
    return metadata

def create_github_issue(metadata, dry_run=True):
    """Create a GitHub issue using gh CLI"""
    title = f"{metadata['id']}: {metadata['title']}"
    body = metadata['body']
    
    # Prepare labels
    labels = []
    
    # Add priority label
    priority_map = {
        'Must Have': 'priority: must-have',
        'Should Have': 'priority: should-have', 
        'Nice to Have': 'priority: nice-to-have'
    }
    if metadata.get('priority') in priority_map:
        labels.append(priority_map[metadata['priority']])
    
    # Add phase label
    if metadata.get('phase'):
        phase_simple = metadata['phase'].replace('Phase ', '').replace(':', '').strip().lower()
        labels.append(f'phase:{phase_simple}')
    
    # Add epic label
    if metadata.get('epic'):
        epic_simple = metadata['epic'].split(':')[0].strip().lower()
        labels.append(f'epic:{epic_simple}')
    
    # Build gh command
    cmd = ['gh', 'issue', 'create', '--title', title, '--body', body]
    
    # Add labels
    for label in labels:
        cmd.extend(['--label', label])
    
    # Add to specific project (if configured)
    # cmd.extend(['--project', 'Stuur Development'])
    
    print(f"\n{'[DRY RUN] ' if dry_run else ''}Creating issue: {title}")
    print(f"Labels: {', '.join(labels)}")
    
    if not dry_run:
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            print(f"Created: {result.stdout.strip()}")
            return True
        except subprocess.CalledProcessError as e:
            print(f"Error creating issue: {e.stderr}")
            return False
    else:
        print(f"Command: {' '.join(cmd)}")
        return True

def main():
    print("Stuur Issue Importer")
    print("====================")
    
    # Ask for confirmation
    response = input("\nRun in dry-run mode? (yes/no, default: yes): ").lower().strip()
    dry_run = not (response == 'no' or response == 'n')
    
    if dry_run:
        print("\nRunning in DRY RUN mode - no issues will be created")
    else:
        print("\nRUNNING FOR REAL - issues will be created on GitHub!")
        confirm = input("Are you sure? (yes/no): ").lower().strip()
        if confirm not in ['yes', 'y']:
            print("Aborted.")
            return
    
    # Get all issue files
    issues_dir = Path('issues')
    issue_files = list(issues_dir.glob('S-*.md'))
    issue_files.sort()
    
    print(f"\nFound {len(issue_files)} issue files")
    
    # Process issues
    created = 0
    for issue_file in issue_files:
        print(f"\nProcessing: {issue_file.name}")
        metadata = parse_issue_file(issue_file)
        
        success = create_github_issue(metadata, dry_run=dry_run)
        if success and not dry_run:
            created += 1
        
        # Small delay to avoid rate limiting
        if not dry_run:
            import time
            time.sleep(1)
    
    print(f"\n{'='*50}")
    if dry_run:
        print(f"DRY RUN COMPLETE: Would create {len(issue_files)} issues")
        print("\nTo actually create issues:")
        print("1. Run: gh auth login")
        print("2. Run this script with: python3 scripts/import_issues.py")
        print("3. Type 'no' when asked about dry-run mode")
    else:
        print(f"COMPLETE: Created {created}/{len(issue_files)} issues")
    
    print("\nNext steps:")
    print("1. Go to GitHub and organize issues into milestones")
    print("2. Create a project board")
    print("3. Start implementing S-001!")

if __name__ == '__main__':
    main()