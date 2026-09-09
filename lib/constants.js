// Default constants and configuration values

const DEFAULTS = {
  syncInterval: 300, // 5 minutes in seconds
  autoSync: true,
  pullBeforePush: true,
  includePathPattern: "**/*.js",
  excludePathPattern: "",
  localScriptPath: "/opt/iobroker/node_modules/iobroker.javascript/lib/scripts/js"
};

const STATES = {
  SYNC_NOW: "syncNow",
  LAST_SYNC: "lastSync",
  LAST_ERROR: "lastError",
  SYNC_STATUS: "syncStatus",
  SYNC_COUNT: "syncCount",
  CONNECTED: "connected"
};

const STATUS = {
  IDLE: "idle",
  SYNCING: "syncing",
  ERROR: "error"
};

const ERRORS = {
  INVALID_CONFIG: "Invalid configuration",
  NO_TOKEN: "GitHub token not configured",
  NO_URL: "GitHub URL not configured",
  CONNECTION_FAILED: "Failed to connect to GitHub",
  SYNC_FAILED: "Sync operation failed",
  PATH_NOT_FOUND: "Local script path not found",
  READ_ERROR: "Error reading files",
  WRITE_ERROR: "Error writing files"
};

module.exports = {
  DEFAULTS,
  STATES,
  STATUS,
  ERRORS
};
