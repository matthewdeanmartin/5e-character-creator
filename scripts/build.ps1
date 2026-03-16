<#
.SYNOPSIS
    Builds the Go application.

.DESCRIPTION
    This script runs the `go build` command to compile the main.go file
    and all its dependencies into a single executable file.

.NOTES
    Execution policy can be set with `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
#>

param(
    # The name for the output executable file
    [string]$OutputName = "character-creator.exe"
)

# --- Set Working Directory ---
# Get the directory where this script is located
$ScriptDir = $PSScriptRoot
# Get the parent directory (the project root)
$ProjectRoot = (Get-Item $ScriptDir).Parent.FullName
# Change the working directory to the project root
Set-Location $ProjectRoot

Write-Host "Building Go application in '$ProjectRoot'..." -ForegroundColor Cyan

# Define the output path relative to the project root
$OutputPath = Join-Path $ProjectRoot $OutputName

# Build the main.go file located in the project root
go build -o $OutputPath main.go

# Check if the build command was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "Executable created: $OutputPath"
} else {
    Write-Host "Build failed." -ForegroundColor Red
    Write-Host "Please check the Go compiler errors above."
}