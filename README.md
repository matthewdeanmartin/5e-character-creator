# Tabletop RPG Character Creator

This project is an educational project I came up with to teach myself Go (and improve my JS proficiency). I chose to build a web-based character creator for tabletop roleplaying games, primarily focused on D&D 5th Edition. 

## Architecture & Tech Stack

This application is built using the following tech stack:
* **Go:** I used this because I wanted to get better with Go. I've heard that Go is great for setting up web servers, so I primarily use it as a way to simplify interacting with the [D&D 5E SRD API](https://5e-bits.github.io/docs/api).
* **Tailwind CSS:** I used this to make the nightmare of styling, layout, and responsive design a little easier on my back-end engineer brain.
* **JavaScript:** I used this to make it easier to build out complex background logic for the webpages.

## Prerequisities

**If using Docker (Recommended):**
* Docker Desktop (for Windows) or Docker Engine (for Linux/Mac)

**If running locally without Docker:**
* [Go 1.22+](https://go.dev/doc/install) installed on your machine.
* PowerShell (for Windows users to use the provided helper scripts).

---

## Development Workflow

You can develop and run this project in two ways: using the isolated Docker container (Option A) or running it directly on your local machine (Option B). 

### Option A: Using the Dev Container (Recommended)
NOTE: Because we use volume mounts, any code changes you make in your local editor will instantly be reflected inside the container.

**1. Start the Dev Container**
Open your terminal in the project root and run:
`docker build -t char-dev-image -f Dockerfile.dev .`
`docker run -d --name char-dev-container -p 8080:8080 -mount type=bind,source="${PWD}",target=/app char-dev-image`

**2. Enter the Container**
Attach your terminal to the running container:
`docker exec -it char-dev-container bash`

**3. Build and Run the App**
We can build and run the app directly through Go commands:
* To run the server directly: `go run main.go`
* To compile a binary: `go build -o character-creator main.go` and run it with `./character-creator`

The server will be accessible at `http://localhost:8080` on your host machine.

### Option B: Local Machine (Windows)
If you have Go installed on your Windows machine, you can use the provided PowerShell scripts to easily compile and run the project.

**1. Build the Application**
Open PowerShell, navigate to the project root, and run:
`.\scripts\build.ps1`
This script runs the `go build` command to compile the `main.go` file into a single executable file named `character-creator.exe`.

**2. Run the Application**
After building, start the server by running:
`.\scripts\run.ps1`
This script executes the application built by the build script. 
Once running, it will output logs directly to your terminal and the server will be accessible at `http://localhost:8080`. 
Press `Ctrl+C` to stop the server at any time.

---

## Production Deployment 

Once you're satisfied with development, you can enjoy the website in its final state. You can use the deployment Docker container to package the required files.

**1. Build the Production Image**
From your local terminal, run:
`docker build -t char-creator-prod -f Dockerfile.deploy .`

**2. Run the Server**
Start the container and map port 8080:
`docker run -p 8080:8080 char-creator-prod`

Once it is running, open your web browser and navigate to `http://localhost:8080` to interact with the character creator!