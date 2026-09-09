/*jshint esversion: 11 */
"use strict";

const utils = require("@iobroker/adapter-core");
const fs = require("fs-extra");
const path = require("path");
const { Octokit } = require("@octokit/rest");
const simpleGit = require("simple-git");
const { shouldIncludeFile } = require("./lib/helpers");

class GitHubSync extends utils.Adapter {
  constructor(options) {
    super({
      ...options,
      name: "githubsync",
    });

    this.config = this.config || {};
    this.namespace = this.namespace || "githubsync";

    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));

    this.syncInterval = null;
    this.syncing = false;
    this.git = null;
    this.octokit = null;
    this.lastSyncTime = 0;
  }

  async onReady() {
    this.config = this.config || {};
    this.namespace = this.namespace || "githubsync";

    // Read config
    this.log.info("Adapter started in instance " + this.instance);

    try {
      await this.initializeStates();
      await this.resolveLocalScriptPath();
      await this.initializeGitHub();
      await this.startSyncLoop();
      
      // Subscribe to state changes
      this.subscribeStates("syncNow");
      
      this.setState("connected", false, true);
    } catch (error) {
      this.log.error("Failed to initialize adapter: " + error.message);
      this.setState("lastError", error.message, true);
      this.setState("syncStatus", "error", true);
    }
  }

  async resolveLocalScriptPath() {
    this.config = this.config || {};

    // Try to auto-detect script path from JavaScript adapter
    if (!this.config.localScriptPath) {
      try {
        const jsAdapterConfig = await this.getObjectAsync("system.adapter.javascript.0");
        if (jsAdapterConfig && jsAdapterConfig.native && jsAdapterConfig.native.dirScripts) {
          this.config.localScriptPath = jsAdapterConfig.native.dirScripts;
          this.log.info(`Auto-detected script path from JavaScript adapter: ${this.config.localScriptPath}`);
          return;
        }
      } catch (error) {
        this.log.debug(`Could not read JavaScript adapter config: ${error.message}`);
      }
    }

    // If still not set, try default paths
    if (!this.config.localScriptPath) {
      const defaultPath = "/opt/iobroker/node_modules/iobroker.javascript/lib/scripts/js";
      this.config.localScriptPath = defaultPath;
      this.log.info(`Using default script path: ${defaultPath}`);
    }

    this.log.info(`Local script path set to: ${this.config.localScriptPath}`);
  }

  async initializeStates() {
    // Create/update states
    const states = [
      { id: "syncNow", val: false },
      { id: "lastSync", val: 0 },
      { id: "lastError", val: "" },
      { id: "syncStatus", val: "idle" },
      { id: "syncCount", val: 0 },
      { id: "connected", val: false },
    ];

    for (const state of states) {
      const fullId = `${this.namespace}.${state.id}`;
      const obj = await this.getObjectAsync(fullId);
      
      if (!obj) {
        this.log.debug(`Creating state ${fullId}`);
      }
      
      this.setState(state.id, state.val, true);
    }
  }

  async initializeGitHub() {
    this.config = this.config || {};
    const token = this.config.gitHubToken;
    const url = this.config.gitHubUrl;

    // Allow adapter to start even if GitHub is not configured
    if (!token || !url) {
      this.log.warn("GitHub not configured. Please configure credentials in adapter settings.");
      this.setState("connected", false, true);
      return;
    }

    // Initialize Octokit (GitHub API client)
    this.octokit = new Octokit({ auth: token });

    // Parse GitHub URL
    const urlParts = this.parseGitHubUrl(url);
    if (!urlParts) {
      throw new Error("Invalid GitHub URL format");
    }

    this.githubInfo = urlParts;

    // Test connection
    try {
      await this.octokit.rest.repos.get({
        owner: urlParts.owner,
        repo: urlParts.repo,
      });
      this.log.info("Successfully connected to GitHub repository");
      this.setState("connected", true, true);
    } catch (error) {
      this.log.error(`Failed to connect to GitHub: ${error.message}`);
      this.setState("connected", false, true);
    }

    // Initialize simple-git
    this.git = simpleGit();
  }

  parseGitHubUrl(url) {
    // Parse GitHub URL (supports https://github.com/owner/repo or git@github.com:owner/repo.git)
    let match;

    if (url.includes("github.com")) {
      match = url.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(".git", ""),
          url: url,
        };
      }
    }

    return null;
  }

  async startSyncLoop() {
    this.config = this.config || {};
    const interval = (this.config.syncInterval || 300) * 1000; // Convert to ms

    if (this.config.autoSync) {
      this.syncInterval = setInterval(() => {
        this.performSync().catch(err => {
          this.log.error("Sync interval error: " + err.message);
        });
      }, interval);

      // Perform initial sync if configured
      if (this.config.gitHubToken && this.config.gitHubUrl) {
        await this.performSync();
      }
    }
  }

  async onStateChange(id, state) {
    if (!state) {
      return;
    }

    this.namespace = this.namespace || "githubsync";
    const localId = id.replace(`${this.namespace}.`, "");

    if (localId === "syncNow" && state.val === true) {
      this.log.info("Manual sync triggered");
      await this.performSync();
      this.setState("syncNow", false, true);
    }
  }

  async performSync() {
    this.config = this.config || {};

    if (this.syncing) {
      this.log.warn("Sync already in progress, skipping");
      return;
    }

    // Check if GitHub is configured
    if (!this.config.gitHubToken || !this.config.gitHubUrl) {
      this.log.debug("GitHub not configured, skipping sync");
      return;
    }

    this.syncing = true;
    this.setState("syncStatus", "syncing", true);

    try {
      this.log.info("Starting sync operation...");

      const localPath = this.config.localScriptPath;
      const syncCount = await this.syncScripts(localPath);

      this.lastSyncTime = Date.now();
      this.setState("lastSync", this.lastSyncTime, true);
      this.setState("syncCount", syncCount, true);
      this.setState("syncStatus", "idle", true);
      this.setState("lastError", "", true);
      this.setState("connected", true, true);

      this.log.info(`Sync completed successfully. ${syncCount} files synced.`);
    } catch (error) {
      this.log.error("Sync failed: " + error.message);
      this.setState("lastError", error.message, true);
      this.setState("syncStatus", "error", true);
      this.setState("connected", false, true);
    } finally {
      this.syncing = false;
    }
  }

  async syncScripts(localPath) {
    // Check if local path exists
    if (!fs.existsSync(localPath)) {
      throw new Error(`Local script path does not exist: ${localPath}`);
    }

    // Get list of local files
    const localFiles = await this.getLocalFiles(localPath);
    this.log.debug(`Found ${localFiles.length} local files`);

    // Get list of files from GitHub
    const githubFiles = await this.getGitHubFiles();
    this.log.debug(`Found ${githubFiles.length} files on GitHub`);

    let syncCount = 0;

    // If pull before push is enabled, fetch latest from GitHub
    if (this.config.pullBeforePush) {
      await this.fetchGitHubContent(localFiles);
      syncCount += localFiles.length;
    }

    // Push local changes to GitHub
    syncCount += await this.pushToGitHub(localPath, localFiles);

    // Move files that were deleted locally into the repo's trash folder
    if (this.config.trashDeletedFiles !== false) {
      syncCount += await this.trashDeletedFiles(localFiles);
    }

    return syncCount;
  }

  async getLocalFiles(basePath) {
    const files = [];
    const includePattern = this.config.includePathPattern || "**/*.js,**/*.ts";
    const excludePattern = this.config.excludePathPattern || "";

    try {
      const allFiles = await fs.readdir(basePath, { recursive: true });

      for (const file of allFiles) {
        const fullPath = path.join(basePath, file);
        const stat = await fs.stat(fullPath);

        if (stat.isFile() && shouldIncludeFile(file, includePattern, excludePattern)) {
          files.push({
            path: file,
            fullPath: fullPath,
            relativePath: path.relative(basePath, fullPath),
          });
        }
      }
    } catch (error) {
      this.log.warn(
        `Error reading local files: ${error.message}`
      );
    }

    return files;
  }

  async getGitHubFiles() {
    const files = [];

    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.githubInfo.owner,
        repo: this.githubInfo.repo,
        path: "/",
      });

      if (Array.isArray(response.data)) {
        for (const item of response.data) {
          if (item.type === "file" && (item.name.endsWith(".js") || item.name.endsWith(".ts"))) {
            files.push({
              path: item.path,
              sha: item.sha,
              url: item.url,
            });
          }
        }
      }
    } catch (error) {
      this.log.warn(`Error fetching GitHub files: ${error.message}`);
    }

    return files;
  }

  /**
   * List all files in the repo's default branch, recursively, via the git tree API.
   */
  async getGitHubFileTree() {
    try {
      const repoInfo = await this.octokit.rest.repos.get({
        owner: this.githubInfo.owner,
        repo: this.githubInfo.repo,
      });
      const branch = repoInfo.data.default_branch;

      const ref = await this.octokit.rest.git.getRef({
        owner: this.githubInfo.owner,
        repo: this.githubInfo.repo,
        ref: `heads/${branch}`,
      });

      const tree = await this.octokit.rest.git.getTree({
        owner: this.githubInfo.owner,
        repo: this.githubInfo.repo,
        tree_sha: ref.data.object.sha,
        recursive: "true",
      });

      return tree.data.tree
        .filter((item) => item.type === "blob")
        .map((item) => ({ path: item.path, sha: item.sha }));
    } catch (error) {
      this.log.warn(`Error fetching GitHub file tree: ${error.message}`);
      return [];
    }
  }

  /**
   * Move files that exist on GitHub but no longer exist locally into a trash/ folder in the repo,
   * instead of leaving them as orphans or silently losing them.
   */
  async trashDeletedFiles(localFiles) {
    const includePattern = this.config.includePathPattern || "**/*.js,**/*.ts";
    const excludePattern = this.config.excludePathPattern || "";
    const localPaths = new Set(localFiles.map((f) => f.relativePath));

    const remoteFiles = await this.getGitHubFileTree();
    let trashedCount = 0;

    for (const remoteFile of remoteFiles) {
      if (remoteFile.path.startsWith("trash/")) continue; // don't re-trash already-trashed files
      if (!shouldIncludeFile(remoteFile.path, includePattern, excludePattern)) continue;
      if (localPaths.has(remoteFile.path)) continue; // still exists locally

      const moved = await this.moveToTrash(remoteFile.path);
      if (moved) trashedCount++;
    }

    return trashedCount;
  }

  /**
   * Copy a file to trash/<path> and delete the original.
   * ponytail: overwrites any previous trash entry at the same path (no versioned trash history)
   */
  async moveToTrash(relativePath) {
    const trashPath = `trash/${relativePath}`;

    try {
      const existing = await this.octokit.rest.repos.getContent({
        owner: this.githubInfo.owner,
        repo: this.githubInfo.repo,
        path: relativePath,
      });

      let trashSha;
      try {
        const trashExisting = await this.octokit.rest.repos.getContent({
          owner: this.githubInfo.owner,
          repo: this.githubInfo.repo,
          path: trashPath,
        });
        trashSha = trashExisting.data.sha;
      } catch {
        trashSha = undefined;
      }

      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.githubInfo.owner,
        repo: this.githubInfo.repo,
        path: trashPath,
        message: `Move deleted file to trash: ${relativePath}`,
        content: existing.data.content,
        sha: trashSha,
      });

      await this.octokit.rest.repos.deleteFile({
        owner: this.githubInfo.owner,
        repo: this.githubInfo.repo,
        path: relativePath,
        message: `Remove locally deleted file: ${relativePath}`,
        sha: existing.data.sha,
      });

      this.log.info(`Moved deleted file to trash: ${relativePath}`);
      return true;
    } catch (error) {
      this.log.warn(`Could not move ${relativePath} to trash: ${error.message}`);
      return false;
    }
  }

  async fetchGitHubContent(localFiles) {
    // Fetch file content from GitHub
    for (const file of localFiles) {
      try {
        const response = await this.octokit.rest.repos.getContent({
          owner: this.githubInfo.owner,
          repo: this.githubInfo.repo,
          path: file.relativePath,
        });

        if (response.data && response.data.content) {
          const content = Buffer.from(
            response.data.content,
            "base64"
          ).toString("utf-8");
          await fs.writeFile(file.fullPath, content);
          this.log.debug(`Updated file from GitHub: ${file.relativePath}`);
        }
      } catch (error) {
        this.log.warn(
          `Could not fetch ${file.relativePath} from GitHub: ${error.message}`
        );
      }
    }
  }

  async pushToGitHub(basePath, localFiles) {
    let pushedCount = 0;

    for (const file of localFiles) {
      try {
        const content = await fs.readFile(file.fullPath, "utf-8");
        const base64Content = Buffer.from(content).toString("base64");

        // Check if file exists on GitHub
        let sha;
        try {
          const existing = await this.octokit.rest.repos.getContent({
            owner: this.githubInfo.owner,
            repo: this.githubInfo.repo,
            path: file.relativePath,
          });
          sha = existing.data.sha;
        } catch {
          sha = undefined; // File doesn't exist on GitHub
        }

        // Upload file
        await this.octokit.rest.repos.createOrUpdateFileContents({
          owner: this.githubInfo.owner,
          repo: this.githubInfo.repo,
          path: file.relativePath,
          message: `Update ${file.relativePath}`,
          content: base64Content,
          sha: sha,
        });

        this.log.debug(`Pushed to GitHub: ${file.relativePath}`);
        pushedCount++;
      } catch (error) {
        if (error.code === "ENOENT" && this.config.trashDeletedFiles !== false) {
          // File vanished between listing and reading (deleted mid-sync) - trash its GitHub copy instead of just warning
          this.log.info(`${file.relativePath} disappeared during sync, moving GitHub copy to trash`);
          await this.moveToTrash(file.relativePath);
        } else {
          this.log.warn(
            `Error pushing ${file.relativePath} to GitHub: ${error.message}`
          );
        }
      }
    }

    return pushedCount;
  }

  async onUnload(callback) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    callback();
  }
}

// Create adapter instance
if (require.main === module) {
  new GitHubSync();
}

module.exports = GitHubSync;
