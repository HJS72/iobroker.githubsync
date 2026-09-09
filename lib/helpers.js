const path = require("path");

/**
 * Parse a GitHub URL (https://github.com/owner/repo or git@github.com:owner/repo.git)
 * @param {string} url - GitHub URL
 * @returns {{owner: string, repo: string, url: string} | null} - Parsed parts, or null if not a valid GitHub URL
 */
function parseGitHubUrl(url) {
  if (!url || !url.includes("github.com")) return null;

  const match = url.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(".git", ""),
    url: url,
  };
}

/**
 * Convert a glob pattern to a regex pattern
 * @param {string} pattern - Glob pattern
 * @returns {RegExp} - Regex pattern
 */
function globToRegex(pattern) {
  // Escape dots, then convert glob tokens in a single pass so replacement
  // text (e.g. inserted "*") is never re-processed by a later replace.
  const escaped = pattern.replace(/\./g, "\\.");
  const regexPattern = escaped.replace(/\*\*\/|\*\*|\*|\?|\//g, (token) => {
    switch (token) {
      case "**/":
        return "(?:.*/)?"; // "**/" also matches zero directories (e.g. root-level files)
      case "**":
        return ".*";
      case "*":
        return "[^/]*";
      case "?":
        return ".";
      case "/":
        return "\\/";
      default:
        return token;
    }
  });

  return new RegExp(`^${regexPattern}$`);
}

/**
 * Check if a file path matches a glob pattern (or any of several comma-separated patterns)
 * @param {string} filePath - File path to check
 * @param {string} pattern - Glob pattern, optionally comma-separated (e.g. "**\/*.js,**\/*.ts")
 * @returns {boolean} - True if matches
 */
function matchesGlobPattern(filePath, pattern) {
  if (!pattern) return true;

  return pattern
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .some((p) => globToRegex(p).test(filePath));
}

/**
 * Check if a file should be included based on include/exclude patterns
 * @param {string} filePath - File path
 * @param {string} includePattern - Include pattern
 * @param {string} excludePattern - Exclude pattern
 * @returns {boolean} - True if should be included
 */
function shouldIncludeFile(filePath, includePattern, excludePattern) {
  if (!matchesGlobPattern(filePath, includePattern)) {
    return false;
  }

  if (excludePattern && matchesGlobPattern(filePath, excludePattern)) {
    return false;
  }

  return true;
}

/**
 * Get relative path from base path
 * @param {string} basePath - Base path
 * @param {string} fullPath - Full path
 * @returns {string} - Relative path
 */
function getRelativePath(basePath, fullPath) {
  return path.relative(basePath, fullPath).replace(/\\/g, "/");
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Create a timestamp string
 * @param {number} ms - Milliseconds
 * @returns {string} - Formatted timestamp
 */
function formatTimestamp(ms) {
  const date = new Date(ms);
  return date.toISOString();
}

/**
 * Get time difference in human readable format
 * @param {number} ms - Milliseconds
 * @returns {string} - Time difference
 */
function formatTimeDiff(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ago`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s ago`;
  return `${seconds}s ago`;
}

/**
 * Validate GitHub URL format
 * @param {string} url - GitHub URL
 * @returns {boolean} - True if valid
 */
function isValidGitHubUrl(url) {
  if (!url) return false;

  // Check for https://github.com/... or git@github.com:...
  return /^(https:\/\/github\.com\/|git@github\.com:)/.test(url);
}

/**
 * Validate GitHub token format
 * @param {string} token - GitHub token
 * @returns {boolean} - True if valid
 */
function isValidGitHubToken(token) {
  if (!token) return false;

  // GitHub tokens typically start with ghp_, gho_, ghu_, or ghs_
  return /^(ghp_|gho_|ghu_|ghs_)/.test(token);
}

module.exports = {
  globToRegex,
  matchesGlobPattern,
  shouldIncludeFile,
  parseGitHubUrl,
  getRelativePath,
  formatFileSize,
  formatTimestamp,
  formatTimeDiff,
  isValidGitHubUrl,
  isValidGitHubToken
};
