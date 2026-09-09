# ioBroker GitHub Script Sync Adapter

[![npm version](https://img.shields.io/npm/v/iobroker.githubsync.svg)](https://www.npmjs.com/package/iobroker.githubsync)
[![Downloads](https://img.shields.io/npm/dm/iobroker.githubsync.svg)](https://www.npmjs.com/package/iobroker.githubsync)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

This ioBroker adapter synchronizes local JavaScript adapter scripts with a private GitHub repository, enabling version control, backup, and team collaboration for your ioBroker automation scripts.

## Features

- 🔄 **Bidirectional Sync**: Sync scripts between local filesystem and GitHub repository
- 🔐 **Private Repository Support**: Full support for private GitHub repositories using personal access tokens
- ⏱️ **Scheduled Sync**: Automatic synchronization at configurable intervals
- 🎯 **Manual Sync**: Trigger synchronization on-demand via `syncNow` state
- 📊 **Monitoring States**: Track sync status, errors, and statistics
- 🔍 **Pattern Matching**: Include/exclude files based on glob patterns
- 🔄 **Pull Before Push**: Optional automatic pull before pushing changes
- 📝 **Comprehensive Logging**: Detailed logging for troubleshooting

## Installation

```bash
npm install iobroker.githubsync
```

Or install via ioBroker admin interface.

## Configuration

### Required Settings

1. **GitHub Repository URL**
   - Format: `https://github.com/username/repository` or `git@github.com:username/repository.git`
   - Example: `https://github.com/myname/iobroker-scripts`

2. **GitHub Personal Access Token**
   - Create a token at: https://github.com/settings/tokens
   - Required scopes: `repo` (for private repository access)
   - Keep this token secure - treat it like a password

3. **Local Script Path** (Optional)
   - Leave empty to auto-detect from JavaScript adapter configuration
   - If auto-detection fails, provide path manually
   - Default fallback: `/opt/iobroker/node_modules/iobroker.javascript/lib/scripts/js`
   - The folder containing your JavaScript adapter scripts

### Optional Settings

- **Sync Interval** (seconds): Default 300 (5 minutes)
- **Auto Sync**: Enable automatic periodic synchronization
- **Pull Before Push**: Fetch latest changes from GitHub before uploading local changes
- **Include Path Pattern**: Glob pattern for files to include (default: `**/*.js`)
- **Exclude Path Pattern**: Glob pattern for files to exclude

## Auto-Detection of Local Script Path

The adapter automatically detects the local script path from the JavaScript adapter configuration. The detection process:

1. First attempts to read the JavaScript adapter instance (javascript.0) configuration
2. Extracts the `dirScripts` setting from the JavaScript adapter
3. If found, uses this path automatically
4. Falls back to default path if JavaScript adapter config is not accessible
5. If manually configured, uses the configured path (overrides auto-detection)

This means you typically don't need to manually specify the script path - the adapter will find it automatically!

## Data Points

The adapter creates the following states in `githubsync.0`:

### Control Points

- `syncNow` (boolean): Set to `true` to trigger immediate sync (automatically resets to `false`)

### Status Points

- `syncStatus` (string): Current status - `idle`, `syncing`, or `error`
- `connected` (boolean): Connection status to GitHub
- `lastSync` (number): Timestamp of last successful sync
- `lastError` (string): Last error message encountered
- `syncCount` (number): Number of files synced in last operation

## Usage Examples

### Trigger Manual Sync
```javascript
// In scripts or automation
setState('githubsync.0.syncNow', true);
```

### Check Sync Status
```javascript
// Verify if sync is in progress
const status = getState('githubsync.0.syncStatus').val;
if (status === 'syncing') {
    console.log('Sync in progress...');
}
```

### Monitor for Errors
```javascript
// Trigger action on sync error
on({id: 'githubsync.0.lastError', change: 'ne'}, function(obj) {
    if (obj.state.val) {
        console.error('GitHub Sync Error: ' + obj.state.val);
        // Send notification, etc.
    }
});
```

### Check Last Sync Time
```javascript
const lastSync = getState('githubsync.0.lastSync').val;
const lastSyncDate = new Date(lastSync);
console.log('Last sync: ' + lastSyncDate.toLocaleString());
```

## Setting Up GitHub

### Create a Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name (e.g., "ioBroker Sync")
4. Select scopes:
   - ✅ `repo` - Full control of private repositories
5. Copy the token (you won't see it again)
6. Paste it in the adapter configuration

### Create a Repository

1. Create a new private repository on GitHub
2. Example: `iobroker-scripts`
3. Optionally add a `.gitignore` for Node modules, etc.
4. Use the repository URL in adapter configuration

## File Synchronization Logic

### Initial Sync
1. Reads all JavaScript files from local script folder
2. Checks for corresponding files on GitHub
3. Uploads local files if not present on GitHub (or updates if different)
4. If "Pull Before Push" is enabled, downloads latest from GitHub first

### Continuous Sync
- Runs at configured intervals (default: 5 minutes)
- Bidirectional: Pulls changes from GitHub and pushes local changes
- Skips if sync already in progress
- Maintains error tracking and status updates

## Pattern Examples

### Include Patterns
- `**/*.js` - All JavaScript files (default)
- `automation/**/*.js` - Only files in automation folder
- `test_*.js` - Files starting with "test_"

### Exclude Patterns
- `node_modules/**` - Exclude node_modules
- `*.tmp` - Exclude temporary files
- `**/.git/**` - Exclude git files

## Troubleshooting

### Connection Issues
- Verify GitHub URL format is correct
- Check that personal access token is valid
- Ensure token has `repo` scope permissions
- Verify network connectivity

### Sync Not Running
- Check that "Auto Sync" is enabled
- Verify sync interval is set correctly
- Check logs for errors in `lastError` state
- Manually trigger sync via `syncNow` state

### File Sync Issues
- Verify local script path exists and is readable
- Check file permissions on local filesystem
- Review pattern matching rules (include/exclude)
- Check file naming conventions (must end with `.js` by default)

### Token/Authentication Errors
- Personal access token may have expired
- Token scopes may be insufficient
- Repository may have changed permissions
- Generate new token if needed

## Security Considerations

⚠️ **Important**: 
- Never commit your GitHub token to version control
- Use environment variables or secure storage for sensitive credentials
- Regularly rotate your personal access tokens
- Use repository-specific tokens if supported by GitHub
- Review repository access logs periodically

## Performance Notes

- Large files may take longer to sync
- Network speed affects sync duration
- Consider sync interval based on change frequency
- Disable auto-sync during heavy ioBroker operations if needed

## Changelog

### 0.0.1
- Initial release
- Basic sync functionality
- GitHub API integration
- Auto and manual sync
- Configuration UI

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions:
- Check the logs in ioBroker admin
- Verify configuration settings
- Review GitHub token permissions
- Submit issues on GitHub repository

## Development

### Local Testing
```bash
npm install
npm run lint
npm test
```

### Building
```bash
npm run pack
```

## Credits

Built with [Octokit](https://github.com/octokit/rest.js) for GitHub API access and [simple-git](https://github.com/steveukx/git-js) for Git operations.
