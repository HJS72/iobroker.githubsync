# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.2] - 2026-09-09

### Fixed
- Bump version to trigger js-controller upgrade routine so missing `instanceObjects` (syncNow, lastSync, lastError, syncStatus, syncCount, connected) get created for existing instances

## [0.0.1]

### Added
- Initial project setup
- Basic adapter structure
- GitHub API integration using Octokit
- Bidirectional file synchronization
- Configuration UI (admin interface)
- Data points for sync monitoring:
  - `syncNow` - trigger manual sync
  - `lastSync` - timestamp of last sync
  - `lastError` - error messages
  - `syncStatus` - current sync state
  - `syncCount` - files synced count
  - `connected` - GitHub connection status
- Support for include/exclude path patterns
- Automatic and manual sync modes
- Pull before push functionality
- Comprehensive error handling and logging
- Multilingual support (English, German, Russian)
- Test suite
- Documentation and examples

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- Secure GitHub token handling
- Repository-level access control

## [0.0.1] - 2024-09-09

### Added
- Initial release
- Basic GitHub sync adapter for ioBroker
- Support for private GitHub repositories
- Automatic periodic synchronization
- Manual sync triggering
- Configuration interface
- File pattern matching (include/exclude)
- Comprehensive logging
- Error tracking and reporting
- Multilingual admin UI

[Unreleased]: https://github.com/HJS72/iobroker.githubsync/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/HJS72/iobroker.githubsync/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/HJS72/iobroker.githubsync/releases/tag/v0.0.1
