# GitHub Actions Workflows

This repository includes automated workflows for continuous integration and deployment.

## Workflows

### Test (`test.yml`)
- **Trigger**: Push to `main` or `develop`, Pull Requests
- **Jobs**:
  - **Lint**: Runs ESLint to check code style
  - **Test**: Executes the test suite
  - **Build**: Creates npm package
- **Status Badge**: [![Test](https://github.com/HJS72/iobroker.githubsync/workflows/Test/badge.svg)](https://github.com/HJS72/iobroker.githubsync/actions?query=workflow:Test)

### Release (`release.yml`)
- **Trigger**: Push a git tag (e.g., `v0.0.1`)
- **Jobs**:
  - Runs lint and tests
  - Creates GitHub Release
  - Publishes to npm registry
- **Note**: Requires `NPM_TOKEN` secret

### Code Quality (`codeql.yml`)
- **Trigger**: Push to `main` or `develop`, Pull Requests, Weekly schedule
- **Jobs**:
  - **Security**: npm audit for vulnerabilities
  - **CodeQL**: GitHub's code analysis tool
- **Status Badge**: [![CodeQL](https://github.com/HJS72/iobroker.githubsync/workflows/Code%20Quality/badge.svg)](https://github.com/HJS72/iobroker.githubsync/actions?query=workflow:Code+Quality)

### Dependabot (`dependabot.yml`)
- **Trigger**: Weekly on Monday at 3:00 AM UTC
- **Function**: Automatically checks for npm dependency updates
- **Creates**: Pull requests with updates, labeled as `dependencies`

## Setting Up Secrets

To enable npm publishing in the Release workflow, add these secrets to your repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add `NPM_TOKEN`:
   - Generate at https://www.npmjs.com/settings/~/tokens
   - Create "Automation" token
   - Paste in GitHub secret

## Making a Release

To create a new release:

```bash
# Update version in package.json
npm version minor  # or major, patch

# Create git tag
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

The Release workflow will automatically:
- Run all tests
- Create a GitHub Release
- Publish to npm

## Workflow Status

All workflows are enabled and configured. Check [Actions tab](https://github.com/HJS72/iobroker.githubsync/actions) for run history and logs.

## Troubleshooting

### Test Failures
- Check workflow logs in Actions tab
- Review changes in pull request
- Run `npm run lint` and `npm test` locally

### npm Publish Fails
- Verify `NPM_TOKEN` is valid
- Check npm registry connectivity
- Review npm audit for security issues

### CodeQL Fails
- Review CodeQL alerts in Security tab
- Address security issues before merge
- CodeQL helps identify potential vulnerabilities
