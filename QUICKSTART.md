# Quick Start Guide

Get your GitHub Script Sync adapter up and running in 5 minutes.

## Prerequisites

- ioBroker installation (v4.0 or higher)
- Node.js 14 or higher
- GitHub account with private repository
- GitHub Personal Access Token

## Step 1: Install the Adapter

### Via ioBroker Admin

1. Open ioBroker Admin Interface
2. Go to **Adapters**
3. Search for "GitHub Script Sync" or "githubsync"
4. Click **Install**

### Via NPM Command Line

```bash
npm install iobroker.githubsync
```

## Step 2: Create GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Fill in:
   - **Note**: "ioBroker GitHub Sync"
   - **Expiration**: Choose appropriate setting (e.g., 90 days, 1 year, or no expiration)
4. Under **Scopes**, select:
   - ✅ `repo` - Full control of private repositories
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Store it securely (e.g., password manager)

## Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name**: `iobroker-scripts` (or your choice)
3. **Description**: "My ioBroker automation scripts"
4. **Privacy**: Select "Private"
5. Initialize with:
   - ✅ README
   - ✅ .gitignore (select "Node")
6. Click "Create repository"
7. Copy the repository URL (HTTPS format)

## Step 4: Configure the Adapter

1. In ioBroker Admin, go to **Instances**
2. Find "githubsync" → Click **Edit** (pencil icon)
3. Fill in the required fields:

   - **GitHub Repository URL**: `https://github.com/YOUR-USERNAME/iobroker-scripts`
   - **GitHub Personal Access Token**: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Local Script Path**: 
     ```
     Leave empty - will auto-detect from JavaScript adapter
     (or manually enter if auto-detection fails)
     ```
   - **Sync Interval**: `300` (5 minutes)
   - ✅ **Auto Sync**: Enabled
   - ✅ **Pull Before Push**: Enabled

4. Click "Save"

## Step 5: Test the Adapter

1. Check if adapter is running (green status in Instances)
2. Go to **Objects** tab
3. Expand `githubsync.0` and verify these states exist:
   - `connected` - Should show `true`
   - `syncStatus` - Should show `idle`
   - `lastError` - Should show empty or no error
4. Trigger manual sync:
   - Set `githubsync.0.syncNow` to `true`
   - Check logs for sync progress
   - Verify files appear in your GitHub repository

## Step 6: Verify Sync

### Check ioBroker Logs

1. Open ioBroker Admin
2. Go to **Log** tab
3. Look for messages from `githubsync` adapter
4. You should see:
   ```
   2024-09-09 12:00:00 INFO: Adapter started in instance 0
   2024-09-09 12:00:01 INFO: Successfully connected to GitHub repository
   2024-09-09 12:00:05 INFO: Sync completed successfully. X files synced.
   ```

### Check GitHub Repository

1. Open your GitHub repository in browser
2. You should see your JavaScript files uploaded
3. Verify file contents match your local scripts

## Step 7: Set Up Monitoring (Optional)

Create a script in the JavaScript adapter to monitor sync:

```javascript
// Monitor sync status
on({id: "githubsync.0.syncStatus"}, function(obj) {
    if (obj.state.val === "error") {
        const error = getState("githubsync.0.lastError").val;
        console.error("GitHub Sync Failed: " + error);
        // Send notification, alert, etc.
    }
});

// Log successful syncs
on({id: "githubsync.0.lastSync", change: "gt"}, function(obj) {
    const count = getState("githubsync.0.syncCount").val;
    console.log(`GitHub Sync: ${count} files synchronized`);
});
```

## Troubleshooting

### Adapter Won't Start

- Check GitHub token is correct
- Verify GitHub URL format: `https://github.com/username/repo`
- Check local script path exists
- Review ioBroker logs for errors

### No Files Syncing

- Verify your local script folder contains `.js` files
- Check file patterns (include/exclude) in configuration
- Manual trigger: Set `syncNow` to `true` and check logs
- Verify GitHub repository is accessible with your token

### "Cannot read file" Error

- Ensure ioBroker has read permissions for local script folder
- Check that JavaScript scripts folder exists
- Verify path is correct in configuration

### GitHub Connection Error

- Verify personal access token is valid and not expired
- Check token has `repo` scope
- Verify internet connectivity from ioBroker server
- Check firewall/proxy settings

## Common Tasks

### Change Sync Interval

1. Edit adapter configuration
2. Change **Sync Interval** (in seconds)
3. Save
4. Adapter restarts with new interval

### Trigger Immediate Sync

In a script:
```javascript
setState("githubsync.0.syncNow", true);
```

### Only Sync Specific Folders

In configuration, set **Include Path Pattern**:
```
automation/**/*.js
```

### Exclude Temporary Files

In configuration, set **Exclude Path Pattern**:
```
*.tmp
test_*.js
disabled/**
```

## Next Steps

- Read the full [README.md](README.md) for advanced features
- Check [EXAMPLES.md](EXAMPLES.md) for more automation scripts
- Visit [GitHub repository](https://github.com/yourusername/iobroker.githubsync) for issues/discussions

## Security Reminders

⚠️ **Important**:
- Never commit your GitHub token to version control
- Treat the token like a password
- Rotate tokens periodically (e.g., every 90 days)
- Use different tokens for different purposes if possible
- Enable two-factor authentication on GitHub account

---

Congratulations! Your GitHub Script Sync adapter is now running. Your scripts are automatically synchronized with GitHub! 🎉
