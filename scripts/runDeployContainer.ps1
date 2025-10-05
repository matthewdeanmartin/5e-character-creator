<#
.SYNOPSIS
Builds and runs the deployment Docker container.
#>

$IMAGE_NAME = "char-creator-deploy-image"
$CONTAINER_NAME = "char-creator-deploy"

Write-Host "Building deployment image '$IMAGE_NAME'..."
docker build -t $IMAGE_NAME -f Dockerfile.deploy .

# Delete any old deployment containers
if (docker ps -aq -f "name=^/${CONTAINER_NAME}$") {
  Write-Host "Found existing container named '$CONTAINER_NAME'. Stopping and removing it..."
  # Stop and remove the old container to prevent conflicts.
  docker rm -f $CONTAINER_NAME
}

# Run the deployment container in detached mode so it doesn't take over the shell
Write-Host "Starting new container '$CONTAINER_NAME'..."
docker run -d `
  --name $CONTAINER_NAME `
  -p 8000:8000 `
  --rm `
  $IMAGE_NAME

Write-Host "`n Success! The application is running in the background."
Write-Host "   Access it in your browser at: http://localhost:8000"
