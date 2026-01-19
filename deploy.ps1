$git = "C:\Program Files\Git\cmd\git.exe"

if (-not (Test-Path $git)) {
    Write-Host "Trying standard path..."
    $git = "C:\Program Files\Git\bin\git.exe"
}

if (-not (Test-Path $git)) {
    Write-Error "Git executable not found. Installation might have failed or installed to a non-standard location."
    exit 1
}

Write-Host "Using Git at: $git"

# Initialize
if (-not (Test-Path ".git")) {
    & $git init
    & $git remote add origin https://github.com/danielvandoesum/acapadel-hero.git
}

# Add and Commit
& $git add .
& $git commit -m "Initial commit: Acapadel Hero Section (Dark Mode)"

# Push
& $git branch -M main
& $git push -u origin main
