# Contributing to ioBroker GitHub Script Sync Adapter

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Be respectful, professional, and constructive in all interactions. We're building this together.

## How to Contribute

### Reporting Bugs

Before creating a bug report, check the issue list to avoid duplicates.

When creating a bug report, include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Your environment (OS, Node.js version, ioBroker version)
- Adapter configuration (mask sensitive data)
- Error logs from ioBroker

### Suggesting Features

- Use a clear, descriptive title
- Provide detailed description of the feature
- Explain why this feature would be useful
- List examples of how it would be used

### Pull Requests

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Make changes** and test thoroughly
4. **Run linter**: `npm run lint`
5. **Run tests**: `npm test`
6. **Commit** with clear, descriptive messages
7. **Push** to your fork
8. **Create a Pull Request** with description of changes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/iobroker.githubsync.git

# Install dependencies
cd iobroker.githubsync
npm install

# Run linter
npm run lint

# Run tests
npm test
```

## Code Style

- Use 2-space indentation
- Use double quotes for strings
- Use semicolons
- Use `const`/`let`, avoid `var`
- Follow ESLint rules in `.eslintrc.json`

Example:
```javascript
const utils = require("@iobroker/adapter-core");

class GitHubSync extends utils.Adapter {
  constructor(options) {
    super(options);
  }
}
```

## Commit Messages

Use clear, descriptive commit messages:
- `Fix: Correct GitHub token validation`
- `Feature: Add dry-run mode`
- `Docs: Update README with examples`
- `Test: Add unit tests for sync logic`

Format: `Type: Brief description`

Types:
- `Feature:` New feature
- `Fix:` Bug fix
- `Docs:` Documentation only
- `Test:` Test additions/changes
- `Refactor:` Code restructuring without behavior change
- `Perf:` Performance improvements
- `CI:` CI/CD changes

## Testing

Add tests for new features:

```javascript
// test/test.js
it("should handle new feature", function() {
  // Test code
});
```

Run tests with: `npm test`

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments to functions
- Update configuration descriptions
- Document breaking changes

## Licensing

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue for questions or discussions about the code.

## Recognition

Contributors will be acknowledged in:
- CHANGELOG.md
- GitHub contributors page
- README.md (for significant contributions)

Thank you for contributing!
