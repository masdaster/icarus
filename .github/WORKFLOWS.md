# GitHub Actions Workflows

This directory contains automated workflows for the ICARUS Terminal project.

## Workflows

### 🔄 Dependency Update (`dependency-update.yml`)
**Trigger:** Weekly (Mondays at 9:00 AM UTC) or manual

**Purpose:** Automatically updates npm and Go dependencies

**Actions:**
- Updates npm packages to latest compatible versions
- Updates Go modules to latest versions
- Runs `npm audit fix` for security patches
- Performs linting checks
- Creates a Pull Request with changes

**Manual Trigger:**
```bash
# Via GitHub UI: Actions → Dependency Update → Run workflow
```

### 📦 Build Release (`build-release.yml`)
**Trigger:** Git tag push (`v*.*.*`) or manual

**Purpose:** Builds the Windows installer (setup.exe)

**Actions:**
- Builds Next.js client application
- Builds Go application
- Builds Node.js service
- Creates NSIS installer
- Uploads installer as artifact
- Creates GitHub Release (for tags)

**Manual Trigger:**
```bash
# Create and push a tag
git tag v0.22.0
git push origin v0.22.0

# Or via GitHub UI: Actions → Build Release → Run workflow
```

**Outputs:**
- `icarus-terminal-installer.exe` (artifact)
- GitHub Release (for version tags)

### ✅ CI/CD (`ci.yml`)
**Trigger:** Push to main/develop or Pull Request

**Purpose:** Continuous integration checks

**Actions:**
- Runs linters (JavaScript + Go)
- Builds all components
- Runs security scans (npm audit + Snyk)
- Validates code formatting

### 🤖 Dependabot (`dependabot.yml`)
**Trigger:** Automatic (GitHub-managed)

**Purpose:** Automated dependency updates via Dependabot

**Features:**
- Weekly npm updates (grouped by category)
- Weekly Go module updates
- Monthly GitHub Actions updates
- Ignores major version updates for stability
- Auto-assigns reviewers and labels

## Usage

### Creating a Release

1. **Update version in package.json:**
   ```json
   {
     "version": "0.23.0"
   }
   ```

2. **Commit and tag:**
   ```bash
   git add package.json
   git commit -m "chore: bump version to 0.23.0"
   git tag v0.23.0
   git push origin main
   git push origin v0.23.0
   ```

3. **Wait for build:**
   - GitHub Actions will automatically build the installer
   - A new release will be created with the installer attached

### Manual Build

1. Go to **Actions** tab
2. Select **Build Release**
3. Click **Run workflow**
4. Enter version number
5. Download installer from **Artifacts**

### Reviewing Dependency Updates

When dependency update PRs are created:

1. Review the changes in `package.json` and `go.mod`
2. Check the PR description for details
3. Test locally if needed:
   ```bash
   git fetch origin
   git checkout deps/automated-update
   npm install
   npm run dev
   ```
4. Approve and merge if tests pass

## Environment Variables / Secrets

### Required for Build Release:
- `GITHUB_TOKEN` - Automatically provided by GitHub

### Optional for Security Scanning:
- `SNYK_TOKEN` - For Snyk security scans (add in repository secrets)

## Build Requirements

The build workflow requires:
- **Node.js 24** - For Next.js and build scripts
- **Go 1.24** - For application compilation
- **NSIS** - For installer creation (installed automatically)
- **Windows runner** - For Windows-specific builds

## Artifacts Retention

- Build artifacts: 30 days
- Release assets: Permanent (attached to releases)

## Troubleshooting

### Build Fails

Check the workflow logs:
1. Go to **Actions** tab
2. Click on the failed workflow
3. Review step-by-step logs

Common issues:
- **Missing dependencies:** Run `npm ci` locally to verify
- **Go build errors:** Check `src/app/go.mod` compatibility
- **NSIS errors:** Verify `resources/installer/installer.nsi` syntax

### Dependency Update Conflicts

If automated PRs conflict:
1. Close the automated PR
2. Manually update dependencies:
   ```bash
   npm update
   cd src/app && go get -u ./... && go mod tidy
   ```
3. Create manual PR

## Maintenance

### Updating Workflows

When modifying workflows:
1. Test locally with [act](https://github.com/nektos/act) (optional)
2. Create feature branch
3. Test in PR before merging to main

### Monitoring

- Check **Actions** tab regularly for failures
- Review Dependabot PRs weekly
- Monitor security advisories

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [NSIS Documentation](https://nsis.sourceforge.io/Docs/)

---

**Last Updated:** November 15, 2025
