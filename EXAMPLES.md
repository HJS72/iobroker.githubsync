# Example Configuration Files

## Configuration Example 1: Basic Setup

For a simple two-way sync with default settings:

```json
{
  "gitHubUrl": "https://github.com/username/iobroker-scripts",
  "gitHubToken": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "localScriptPath": "/opt/iobroker/node_modules/iobroker.javascript/lib/scripts/js",
  "syncInterval": 300,
  "autoSync": true,
  "pullBeforePush": true,
  "includePathPattern": "**/*.js",
  "excludePathPattern": ""
}
```

## Configuration Example 2: Pull-Only Mode

To only download changes from GitHub and not push local changes:

```json
{
  "gitHubUrl": "https://github.com/username/iobroker-scripts",
  "gitHubToken": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "localScriptPath": "/opt/iobroker/node_modules/iobroker.javascript/lib/scripts/js",
  "syncInterval": 600,
  "autoSync": true,
  "pullBeforePush": true,
  "includePathPattern": "**/*.js",
  "excludePathPattern": "test_*.js"
}
```

## Configuration Example 3: Selective Sync

To sync only specific automation scripts:

```json
{
  "gitHubUrl": "https://github.com/username/iobroker-scripts",
  "gitHubToken": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "localScriptPath": "/opt/iobroker/node_modules/iobroker.javascript/lib/scripts/js",
  "syncInterval": 1800,
  "autoSync": true,
  "pullBeforePush": false,
  "includePathPattern": "automation/**/*.js",
  "excludePathPattern": "automation/disabled/**"
}
```

## Configuration Example 4: Manual Sync Only

To disable auto-sync and only use manual triggers:

```json
{
  "gitHubUrl": "https://github.com/username/iobroker-scripts",
  "gitHubToken": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "localScriptPath": "/opt/iobroker/node_modules/iobroker.javascript/lib/scripts/js",
  "syncInterval": 3600,
  "autoSync": false,
  "pullBeforePush": true,
  "includePathPattern": "**/*.js",
  "excludePathPattern": ""
}
```

## Script Automation Examples

### JavaScript Adapter Script - Scheduled Sync

```javascript
// Trigger sync every 30 minutes (if autoSync is disabled)
schedule("*/30 * * * *", function() {
    setState("githubsync.0.syncNow", true);
    console.log("GitHub sync triggered");
});
```

### JavaScript Adapter Script - Notification on Error

```javascript
// Send notification if sync fails
on({id: "githubsync.0.lastError", change: "ne"}, function(obj) {
    if (obj.state.val && obj.state.val !== "") {
        console.error("GitHub Sync Error: " + obj.state.val);
        // Send telegram notification (requires telegram adapter)
        setState("telegram.0.send", {
            text: "GitHub Sync Error: " + obj.state.val,
            user: "admin"
        });
    }
});
```

### JavaScript Adapter Script - Sync Status Monitor

```javascript
// Monitor sync progress
on({id: "githubsync.0.syncStatus", change: "ne"}, function(obj) {
    console.log("Sync Status: " + obj.state.val);
    
    if (obj.state.val === "syncing") {
        console.log("Sync started");
    } else if (obj.state.val === "idle") {
        const count = getState("githubsync.0.syncCount").val;
        const lastError = getState("githubsync.0.lastError").val;
        console.log(`Sync completed: ${count} files, Error: ${lastError || "None"}`);
    }
});
```

### JavaScript Adapter Script - Before Shutdown Sync

```javascript
// Sync before ioBroker restarts
schedule({time: "0 2 * * *", once: false}, function() {
    console.log("Running pre-shutdown sync...");
    setState("githubsync.0.syncNow", true);
    
    // Wait for sync to complete
    setTimeout(() => {
        const status = getState("githubsync.0.syncStatus").val;
        if (status === "idle") {
            console.log("Pre-shutdown sync completed");
        }
    }, 30000);
});
```

## .gitignore Example for GitHub Repository

Create a `.gitignore` in your GitHub repository to exclude unnecessary files:

```
# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.backup
*.bak

# Dependencies (if you have node modules)
node_modules/
package-lock.json

# Local development
.env
.env.local
.vscode/
.idea/

# ioBroker specific
tmp/
log/

# Deprecated or disabled scripts
disabled/
archive/
```

## GitHub Token Scope Requirements

For the adapter to work, your GitHub Personal Access Token needs these scopes:

- ✅ `repo` - Full control of private repositories (required)
- ✅ `read:org` - Read access to organization info (optional)

Minimum required: `repo` scope only

## Network Considerations

If you're behind a proxy or firewall:

```javascript
// Set proxy in environment before running ioBroker
process.env.HTTP_PROXY = "http://proxy-server:8080";
process.env.HTTPS_PROXY = "http://proxy-server:8080";
```

## Troubleshooting Configuration

### Debug Mode
Enable debug logging in ioBroker admin for the adapter to see detailed sync information.

### Test Connection
Add this to your script to verify configuration:

```javascript
// Test GitHub connection
setState("githubsync.0.syncNow", true);

setTimeout(() => {
    const connected = getState("githubsync.0.connected").val;
    const lastError = getState("githubsync.0.lastError").val;
    
    console.log("Connected: " + connected);
    console.log("Error: " + (lastError || "None"));
}, 5000);
```
