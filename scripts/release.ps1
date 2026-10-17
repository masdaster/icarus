# EDData-ICARUS Terminal Release Script
# Creates Git tag and triggers GitHub Actions to build and publish release

param(
    [Parameter(Mandatory=$false)]
    [string]$Version,

    [Parameter(Mandatory=$false)]
    [string]$Message = "Release",

    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

# Get version from package.json if not provided
if (-not $Version) {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $Version = $packageJson.version
    Write-Host "Using version from package.json: $Version" -ForegroundColor Cyan
}

# Ensure version starts with 'v'
if (-not $Version.StartsWith('v')) {
    $Version = "v$Version"
}

Write-Host "`n=== EDData-ICARUS Terminal Release ===" -ForegroundColor Green
Write-Host "Version: $Version" -ForegroundColor Yellow
Write-Host "Message: $Message" -ForegroundColor Yellow
if ($DryRun) {
    Write-Host "Mode: DRY RUN (no changes will be made)" -ForegroundColor Magenta
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not in a git repository!" -ForegroundColor Red
    exit 1
}

# Check if tag already exists
$existingTag = git tag -l $Version
if ($existingTag) {
    Write-Host "`nWarning: Tag $Version already exists!" -ForegroundColor Yellow
    $confirm = Read-Host "Delete existing tag and recreate? (y/N)"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        if (-not $DryRun) {
            Write-Host "Deleting local tag..." -ForegroundColor Cyan
            git tag -d $Version
            Write-Host "Deleting remote tag..." -ForegroundColor Cyan
            git push origin ":refs/tags/$Version" 2>$null
        } else {
            Write-Host "[DRY RUN] Would delete tag: git tag -d $Version" -ForegroundColor Gray
            Write-Host "[DRY RUN] Would delete remote: git push origin :refs/tags/$Version" -ForegroundColor Gray
        }
    } else {
        Write-Host "Aborted." -ForegroundColor Red
        exit 1
    }
}

# Show uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "`nUncommitted changes found:" -ForegroundColor Yellow
    git status --short
    $confirm = Read-Host "Commit these changes? (y/N)"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        if (-not $DryRun) {
            git add .
            git commit -m "Prepare release $Version"
            Write-Host "Changes committed." -ForegroundColor Green
        } else {
            Write-Host "[DRY RUN] Would commit with message: Prepare release $Version" -ForegroundColor Gray
        }
    } else {
        Write-Host "`nWarning: Proceeding with uncommitted changes." -ForegroundColor Yellow
    }
}

# Create Git tag
Write-Host "`nCreating Git tag $Version..." -ForegroundColor Cyan
if (-not $DryRun) {
    git tag -a $Version -m "$Message"

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create tag!" -ForegroundColor Red
        exit 1
    }

    Write-Host "Tag created successfully." -ForegroundColor Green
} else {
    Write-Host "[DRY RUN] Would create tag: git tag -a $Version -m `"$Message`"" -ForegroundColor Gray
}

# Push tag to trigger GitHub Actions
Write-Host "`nPushing tag to GitHub..." -ForegroundColor Cyan
if (-not $DryRun) {
    git push origin $Version

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to push tag!" -ForegroundColor Red
        Write-Host "You can manually push with: git push origin $Version" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "[DRY RUN] Would push: git push origin $Version" -ForegroundColor Gray
}

Write-Host "`n=== Release Created Successfully! ===" -ForegroundColor Green
Write-Host "GitHub Actions will now build the installer and create a release." -ForegroundColor Cyan
Write-Host "Check progress at: https://github.com/EDDataAPI/icarus/actions" -ForegroundColor Cyan
Write-Host "`nRelease will be available at: https://github.com/EDDataAPI/icarus/releases/tag/$Version" -ForegroundColor Yellow
