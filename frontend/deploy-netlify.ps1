# Netlify Deploy Script - Uses Netlify API directly (no CLI needed)
# Usage: .\deploy-netlify.ps1 -Token "your_netlify_personal_access_token"
# Get token from: https://app.netlify.com/user/applications#personal-access-tokens

param(
    [Parameter(Mandatory=$false)]
    [string]$Token,
    [string]$SiteName = "got-transportation",
    [string]$DistDir = "dist"
)

if (-not $Token) {
    $Token = $env:NETLIFY_AUTH_TOKEN
}

if (-not $Token) {
    Write-Host "ERROR: No Netlify token provided." -ForegroundColor Red
    Write-Host ""
    Write-Host "To deploy, you need a Netlify Personal Access Token:" -ForegroundColor Yellow
    Write-Host "1. Go to https://app.netlify.com/user/applications#personal-access-tokens"
    Write-Host "2. Click 'New access token'"
    Write-Host "3. Run: .\deploy-netlify.ps1 -Token 'your_token_here'"
    Write-Host ""
    Write-Host "Or set environment variable: `$env:NETLIFY_AUTH_TOKEN = 'your_token'" 
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# Step 1: Check for existing site or create new one
Write-Host "Checking for existing site '$SiteName'..." -ForegroundColor Cyan
try {
    $sites = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites?name=$SiteName" -Headers $headers -Method Get
    $site = $sites | Where-Object { $_.name -eq $SiteName } | Select-Object -First 1
} catch {
    $site = $null
}

if (-not $site) {
    Write-Host "Creating new Netlify site '$SiteName'..." -ForegroundColor Cyan
    $body = @{
        name = $SiteName
    } | ConvertTo-Json
    
    try {
        $site = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites" -Headers $headers -Method Post -Body $body
        Write-Host "Site created: $($site.ssl_url)" -ForegroundColor Green
    } catch {
        Write-Host "Could not create site with name '$SiteName'. Trying without specific name..." -ForegroundColor Yellow
        $site = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites" -Headers $headers -Method Post -Body "{}"
        Write-Host "Site created: $($site.ssl_url)" -ForegroundColor Green
    }
} else {
    Write-Host "Found existing site: $($site.ssl_url)" -ForegroundColor Green
}

$siteId = $site.id

# Step 2: Build file hash manifest
Write-Host "Building deploy manifest from '$DistDir'..." -ForegroundColor Cyan
$files = @{}
$distPath = Resolve-Path $DistDir

Get-ChildItem -Path $distPath -Recurse -File | ForEach-Object {
    $relativePath = "/" + ($_.FullName.Substring($distPath.Path.Length + 1) -replace '\\', '/')
    $hash = (Get-FileHash $_.FullName -Algorithm SHA1).Hash.ToLower()
    $files[$relativePath] = $hash
}

Write-Host "Found $($files.Count) files to deploy" -ForegroundColor Cyan

# Step 3: Create deploy
Write-Host "Creating deploy..." -ForegroundColor Cyan
$deployBody = @{
    files = $files
} | ConvertTo-Json -Depth 10

$deploy = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites/$siteId/deploys" -Headers $headers -Method Post -Body $deployBody -ContentType "application/json"

$deployId = $deploy.id
$requiredFiles = $deploy.required

Write-Host "Deploy created. Uploading $($requiredFiles.Count) files..." -ForegroundColor Cyan

# Step 4: Upload required files
$uploadHeaders = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/octet-stream"
}

$fileHashMap = @{}
$files.GetEnumerator() | ForEach-Object {
    $fileHashMap[$_.Value] = $_.Key
}

$uploaded = 0
foreach ($hash in $requiredFiles) {
    $filePath = $fileHashMap[$hash]
    if ($filePath) {
        $fullPath = Join-Path $distPath ($filePath.TrimStart('/'))
        $fileBytes = [System.IO.File]::ReadAllBytes($fullPath)
        
        $encodedPath = [System.Uri]::EscapeDataString($filePath)
        $url = "https://api.netlify.com/api/v1/deploys/$deployId/files$filePath"
        
        try {
            Invoke-RestMethod -Uri $url -Headers $uploadHeaders -Method Put -Body $fileBytes | Out-Null
            $uploaded++
            Write-Host "  Uploaded ($uploaded/$($requiredFiles.Count)): $filePath" -ForegroundColor Gray
        } catch {
            Write-Host "  FAILED: $filePath - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Step 5: Get final deploy status
Start-Sleep -Seconds 3
$finalDeploy = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/deploys/$deployId" -Headers $headers -Method Get

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Site URL:    $($site.ssl_url)" -ForegroundColor White
Write-Host "Deploy URL:  $($finalDeploy.deploy_ssl_url)" -ForegroundColor White
Write-Host "Admin URL:   https://app.netlify.com/sites/$($site.name)" -ForegroundColor White
Write-Host "Status:      $($finalDeploy.state)" -ForegroundColor Cyan
Write-Host ""
