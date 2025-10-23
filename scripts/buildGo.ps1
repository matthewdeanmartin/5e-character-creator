# This script sets the required environment variables and builds the Go package into a Wasm binary.

# --- Go Module Initialization Check ---
# Check if a go.mod file exists in the project root.
if (-not (Test-Path ./go.mod)) {
    Write-Host "go.mod not found. Initializing Go module..." -ForegroundColor Yellow
    # If it doesn't exist, run 'go mod init' to create it.
    go mod init character-creator
} else {
    Write-Host "Go module already initialized."
}

# --- Wasm Build Process ---
Write-Host "Setting Go environment for Wasm build..."
$env:GOOS = "js"
$env:GOARCH = "wasm"

# The key change is here: we build the './cmd/wasm' directory (the package)
# instead of listing each .go file individually. This is the standard Go practice.
Write-Host "Building Go Wasm module..."
go build -o ./web/main.wasm ./go

if ($LASTEXITCODE -ne 0) {
    Write-Host "Go build failed!" -ForegroundColor Red
} else {
    Write-Host "Go Wasm module built successfully to ./web/main.wasm" -ForegroundColor Green
}


# Unset the environment variables after the build
Remove-Item -ErrorAction SilentlyContinue env:GOOS
Remove-Item -ErrorAction SilentlyContinue env:GOARCH