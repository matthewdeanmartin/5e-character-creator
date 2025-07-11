#!/bin/bash

# This script prepares and builds the Go WebAssembly module for the D&D character sheet.

# --- Step 1: Locate the required wasm_exec.js file ---
echo "Locating Go installation directory..."
GOROOT_PATH=$(go env GOROOT)

# Check if the GOROOT path was found
if [ -z "$GOROOT_PATH" ]; then
    echo "Error: Could not determine Go installation path. Is Go installed and in your PATH?" >&2
    return
fi

# The correct path for wasm_exec.js in modern Go versions is in the 'misc/wasm' directory.
WASM_EXEC_JS_PATH="$GOROOT_PATH/lib/wasm/wasm_exec.js"
DEST_JS_DIR="../front-end"

echo "Checking for wasm_exec.js at: $WASM_EXEC_JS_PATH"

if [ ! -f "$WASM_EXEC_JS_PATH" ]; then
    echo "Error: wasm_exec.js not found at the expected location." >&2
    echo "       Please ensure you have a standard Go (>= v1.24) installation." >&2
    return
fi

echo "Found wasm_exec.js!"

# --- Step 2: Copy wasm_exec.js to the local project directory ---
# Create the js directory if it doesn't exist
mkdir -p "$DEST_JS_DIR"

echo "Copying wasm_exec.js to $DEST_JS_DIR/ ..."
cp "$WASM_EXEC_JS_PATH" "$DEST_JS_DIR/"

if [ $? -ne 0 ]; then
    echo "Error: Failed to copy wasm_exec.js." >&2
    return
fi

echo "Successfully copied wasm_exec.js."


# --- Step 3: Compile the Go code to WebAssembly ---
echo "Compiling main.go to main.wasm..."

# Set the GOOS and GOARCH environment variables to compile for a browser environment
GOOS=js GOARCH=wasm go build -o main.wasm main.go

# Check if the compilation was successful
if [ $? -ne 0 ]; then
    echo "Error: Go compilation failed. Please check for errors in main.go." >&2
    exit 1
fi

echo "🎉 Build successful! Your 'main.wasm' file is ready."
echo "    You can now run your local server to see the application."

