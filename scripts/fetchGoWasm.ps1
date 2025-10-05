# This script copies the required wasm_exec.js file from the Go installation
# into the current directory.

$goRoot = go env GOROOT
$sourceFile = Join-Path $goRoot "lib/wasm/wasm_exec.js"
$destinationPath = "./web/"
$destinationFile = Join-Path -Path $destinationPath -ChildPath (Get-Item $sourceFile).Name

if (-not (Test-Path $destinationFile)) {
    Copy-Item -Path $sourceFile -Destination $destinationPath   
    Write-Host "$destinationFile copied successfully."  
} else {
    Write-Host "File $destinationFile already exists."
}
