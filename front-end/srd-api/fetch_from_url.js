import { BASE_SRD_API_URL } from "./consts.js";

// Fetch 10 entries at a time
const BATCH_SIZE = 10;
// Wait a quarter of a second between batches
const DELAY_MS = 250;

export async function fetchResponseFromUrl(fetchUrl) {
    try {
        const response = await fetch(fetchUrl);
        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP Error encountered while interfacing with D&D 5E SRD API! Status: ${response.status}`);
        }
        // Extract JSON from the HTTP response
        return await response.json();
    } catch (error) {
        console.error("Caught an error while interacting with the D&D 5E SRD API: ", error);
        // Return a structured error object
        return { error: true, message: error.message, results: [] };
    }
}

export async function fetchIndicesFromUrl(fetchUrl) {
    try {
        const responseJson = await fetchResponseFromUrl(fetchUrl);
        // Extract result indices from the response JSON
        const resultIndices = responseJson.results;

        return resultIndices;
    } catch (error) {
        console.error("Failed to fetch result indices:", error);
        // Return a structured error object
        return { error: true, message: error.message };
    }
}

export async function batchFetchDetailsFromApi(entryIndices=[]) {
    // Check if it is necessary to batch the fetches
    if (entryIndices.length < BATCH_SIZE) {
        // Build batch of Promises to fetch details
        const promises =
            entryIndices.map((entryIndex) =>
                fetch(BASE_SRD_API_URL + entryIndex.url).then((response) => response.json())
            );
        // Await current batch of details
        const detailsResponses = await Promise.all(promises);

        return detailsResponses;
    }

    let detailsResponses = [];
    // It is necessary to batch the fetches, slice the entry indices according to maximum batch size
    for (let batchInd = 0; batchInd < entryIndices.length; batchInd += BATCH_SIZE) {
        const batchedIndices = entryIndices.slice(batchInd, batchInd + BATCH_SIZE);
        // Build batch of Promises to fetch details
        const promises =
            batchedIndices.map((batchIndex) =>
                fetch(BASE_SRD_API_URL + batchIndex.url).then((response) => response.json())
            );
        // Await current batch of details
        try {
            const batchDetailsResponses = await Promise.all(promises);
            // Append current batch's details to the complete list of details
            detailsResponses.push(...batchDetailsResponses);
        } catch (error) {
            console.error("Failed to fetch one of the batched result indices:", error);
            // Return a structured error object
            return { error: true, message: error.message };
        }
        // Wait for a little before requesting another batch of details
        if (batchInd + BATCH_SIZE < entryIndices.length) {
            await new Promise(waitResponse => setTimeout(waitResponse, DELAY_MS));
        }
    }

    return detailsResponses;
}
