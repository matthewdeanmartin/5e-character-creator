export async function fetchFromUrl(fetchUrl) {
    try {
        const response = await fetch(fetchUrl);
        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP Error encountered while interfacing with D&D 5E SRD API! Status: ${response.status}`);
        }
        // Extract JSON from the HTTP response
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch spells:", error);
        // Return a structured error object
        return { error: true, message: error.message, results: [] };
    }
}