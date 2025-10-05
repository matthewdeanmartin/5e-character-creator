# This script sets the required environment variables for the current command
# and then runs the Go build process to create the Wasm binary.

$env:GOOS = "js"
$env:GOARCH = "wasm"
go build -o ./web/main.wasm ./go/characterEngine.go ./go/main.go

# Unset the environment variables after the build (not required)
Remove-Item env:GOOS
Remove-Item env:GOARCH
