<#
.SYNOPSIS
This script enters the development container, starting it if not already running.
#>

$IMAGE_NAME="char-creator-dev-image"
$CONTAINER_NAME="char-creator-dev"

if (Get-Command docker -ErrorAction SilentlyContinue) {
	Write-Host "The 'docker' command exists."
} else {
	Write-Host "The 'docker' command does not exist or is not in the system's PATH."
	exit
}

# Build dev image only if it's not built already
if (-not (docker images -q "${IMAGE_NAME}:latest")) {
	Write-Host "Development image '${IMAGE_NAME}' not found. Building it now..."
	docker build -t $IMAGE_NAME -f Dockerfile .
}

# Run the dev container only if it's not running already
if (docker ps -q -f "name=^/${CONTAINER_NAME}$") {
	Write-Host "Attaching to running container '${CONTAINER_NAME}'..."
	docker exec -it $CONTAINER_NAME sh
	exit
}

# Restart the dev container if present but not running
if (docker ps -aq -f "status=exited" -f "name=^/${CONTAINER_NAME}$") {
	Write-Host "Starting and attaching to existing container '${CONTAINER_NAME}'..."
	docker start $CONTAINER_NAME
	docker exec -it $CONTAINER_NAME sh
	exit
}

Write-Host "Container '${CONTAINER_NAME}' not found. Creating a new one..."
Write-Host "Mounting current directory '$($PWD.Path)' to '/app' in the container."
docker run -it --name $CONTAINER_NAME -v "${PWD}:/app" $IMAGE_NAME sh