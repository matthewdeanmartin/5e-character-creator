import { BASE_SRD_API_URL } from "./consts.js";

// Fetch 10 entries at a time
const BATCH_SIZE = 10;
// Wait a quarter of a second between batches
const DELAY_MS = 250;

export async function batchFetchFromApi(entryIndices=[]) {
    let spells = []
    for (let batchInd = 0; batchInd < entryIndices.length; batchInd += BATCH_SIZE) {
        const batchedIndices = entryIndices.slice(batchInd, batchInd + BATCH_SIZE);
        // Build batch of Promises to fetch some spell details
        const promises =
            batchedIndices.map((batchIndex) =>
                fetch(BASE_SRD_API_URL + batchIndex.url).then((response) => response.json())
            );
        // Await current batch of spell details
        const batchSpells = await Promise.all(promises);
        spells.push(...batchSpells);
        // Wait for a little before requesting another batch of spell details
        if (batchInd + BATCH_SIZE < entryIndices.length) {
            await new Promise(waitResponse => setTimeout(waitResponse, DELAY_MS));
        }
    }
}