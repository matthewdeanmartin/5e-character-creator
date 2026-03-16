<#
.SYNOPSIS
    Runs the compiled Go application.

.DESCRIPTION
    This script executes the application built by 'build.ps1'.
    It first checks if the executable file exists.

.NOTES
    Execution policy can be set with `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

#>

param(
    # The name of the executable to run
    [string]$ExecutableName = "character-creator.exe"
)

# --- Set Working Directory ---
# Get the directory where this script is located
$ScriptDir = $PSScriptRoot
# Get the parent directory (the project root)
$ProjectRoot = (Get-Item $ScriptDir).Parent.FullName
# Change the working directory to the project root
Set-Location $ProjectRoot

# --- Find and Run Executable ---
$ExecutablePath = Join-Path $ProjectRoot $ExecutableName

# Check if the executable file exists in the project root
if (-not (Test-Path -Path $ExecutablePath)) {
    Write-Host "Executable '$ExecutablePath' not found." -ForegroundColor Red
    Write-Host "Please run '.\scripts\build.ps1' first to build the application."
    # Exit the script
    exit 1
}

Write-Host "Starting Go service from '$ExecutablePath'..." -ForegroundColor Cyan
Write-Host "- You can access the server at http://localhost:8080"
Write-Host "- Press Ctrl+C to stop the server."

try {
    # Start the executable in the current window so logs are displayed
    # and Ctrl+C will stop it.
    & $ExecutablePath
} catch {
    Write-Host "An error occurred while running the application: $_" -ForegroundColor Red
}