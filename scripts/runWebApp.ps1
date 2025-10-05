# Starts a simple local web server using Python to run the Go Wasm application.

$Port = 8000

# Check if python3 or python is available
$PythonExe = Get-Command python -ErrorAction SilentlyContinue
if (-not $PythonExe) {
    $PythonExe = Get-Command python3 -ErrorAction SilentlyContinue
}

if (-not $PythonExe) {
    Write-Error "Python could not be found in the PATH."
    Write-Host "Please install Python 3 to use this script, or ensure it's accessible."
    exit 1
}

Write-Host "Found $($PythonExe.Source)"
Write-Host "Starting Python's HTTP server on port $Port..."
Write-Host "Access the application at: http://localhost:$($Port)"
Write-Host "Press Ctrl+C to stop the server."

try {
    # Start the python http.server module. This will block until stopped.
    & $PythonExe.Source "-m" "http.server" $Port
}
catch {
    # This block will be executed when the user presses Ctrl+C
    Write-Host "`nServer stopped."
}