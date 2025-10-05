# Tabletop RPG Character Creator

This project is a web-based character creator for tabletop roleplaying games. The core business logic is written in Go and compiled to WebAssembly (Wasm) to run directly in the browser. The user interface is a simple HTML and JavaScript shell.

This project uses Docker to create a consistent development and deployment environment, ensuring that it builds and runs the same way for all contributors.

## Prerequisities

You must have the following software installed on your machine:
- Docker Desktop (for Windows) or Docker Engine (for Linux)

## Development Workflow 

All development should be done inside the development container. This container has the correct version of Go and all necessary tools pre-installed. The helper script `scripts/enterDevContainer.ps1` (for Windows PowerShell) will manage this process for you.
- NOTE: You may need to set your execution policy if you haven't already: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` 

Your project files are mounted directly into the container, so any changes you make with your local editor will be immediately reflected inside the container, and vice-versa.

The first time you run this, it will build the `char-creator-dev` Docker image which will automatically start up a container. On subsequent runs, it should use the already-running container. You will now be inside a shell within the container, at the /app directory and capable of running build scripts.

### Initial Setup

The first time you enter the development container, you will need to fetch the Go Wasm JavaScript helper files. The helper script `scripts/fetchGoWasm.ps1` will manage this process for you.

### Build the Wasm Module

Whenever you make changes to `.go` source files, you need to recompile the WebAssembly module. The helper script `scripts/buildGo.sh` will do this for you.

## Run the Application for Testing

To see your changes in action, you need to build and run the deployment container. This container runs a lightweight web server to serve your `index.html`, `main.wasm`, and JavaScript files.

From your local machine's terminal (not inside the dev container), run the PowerShell deployment script `scripts/runDeployContainer.ps1` (for Windows PowerShell).

This script will:
1. Build a deployment image from `Dockerfile.deploy`.
2. Stop and remove any old version of the application container.
3. Start a new container in the background.

Once it's running, you can view the application by navigating to `http://localhost:8000` in your web browser.