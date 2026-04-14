# GitHub Repository Setup Instructions

Follow these steps to create a GitHub repository and push the Stuur project.

## Step 1: Create a New GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the **+** icon in the top-right corner → **New repository**
3. Fill in:
   - **Repository name:** `stuur`
   - **Description:** "Personal AI assistant for Telegram and WhatsApp"
   - **Visibility:** Public (or Private if preferred)
   - **Initialize with:** ☐ **DO NOT** add README, .gitignore, or license
4. Click **Create repository**

## Step 2: Connect Local Repository to GitHub

Copy the commands from the "push an existing repository" section on GitHub. They will look like:

```bash
cd /data/.openclaw/workspace/stuur-project
git remote add origin https://github.com/YOUR_USERNAME/stuur.git
git branch -M main
git push -u origin main
```

## Step 3: Import Issues to GitHub

After pushing the code, you can import the issues:

### Option A: Manual Import (Recommended)
1. Go to your repository on GitHub
2. Click **Issues** tab
3. Click **New issue** for each user story
4. Copy-paste content from `issues/S-XXX.md` files
5. Add appropriate labels (enhancement, bug, etc.)
6. Assign to milestones (Phase 1, Phase 2, etc.)

### Option B: Use GitHub CLI (Advanced)
```bash
# Install GitHub CLI first
gh issue create --title "S-001: Basic Telegram bot with echo functionality" --body "$(cat issues/S-001.md)"
# Repeat for all 55 issues
```

### Option C: Use GitHub API Script
See `scripts/import_issues.py` for a potential automation script.

## Step 4: Set Up Project Board

1. Go to your repository → **Projects** tab
2. Click **New project** → **Board**
3. Name it "Stuur Development"
4. Add columns: Backlog, To Do, In Progress, Review, Done
5. Add all issues to the board

## Step 5: Create Milestones

1. Go to **Issues** → **Milestones**
2. Create milestones for each phase:
   - **Phase 1: Foundation** (Due: 8 weeks from start)
   - **Phase 2: Core Features** (Due: 16 weeks from start)
   - **Phase 3: Polish** (Due: 24 weeks from start)
   - **Phase 4: Growth** (Due: 50 weeks from start)

3. Assign issues to appropriate milestones based on their `Sprint` field

## Step 6: Set Up GitHub Actions (Optional)

Create `.github/workflows/ci.yml` for automated testing:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
```

## Quick Reference Commands

```bash
# Navigate to project
cd /data/.openclaw/workspace/stuur-project

# Check git status
git status

# View commit history
git log --oneline

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/stuur.git

# Push to GitHub
git push -u origin main

# Update later
git add .
git commit -m "Your message"
git push
```

## Need Help?

- [GitHub Docs](https://docs.github.com)
- [GitHub CLI Documentation](https://cli.github.com/)
- [GitHub Issues API](https://docs.github.com/en/rest/issues/issues)

---

**Your Stuur project is now ready for development!** 🎉

Next steps:
1. Implement S-001 (Basic Telegram bot)
2. Set up Docker Compose with SurrealDB
3. Start building the Identity Core