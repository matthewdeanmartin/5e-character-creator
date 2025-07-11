# 5th Edition Character Creator Served on HTTP Webpage

## How-To

1. Install `npm` dependencies by running `npm run setup`
2. Start the HTTP server on `localhost` by running `npm run start`
3. Navigate through your browser of choice to: http://192.168.1.18:8080/character-sheet.html

## SRD Processor

The `srd-processor` directory contains a Python script which attempts to parse out the actual spell definitions from the SRD v5.2.1 (available for download [here](https://www.dndbeyond.com/srd) in PDF format)

## Inter-relation of Code

While the `srd-processor` (written in Python) does struggle to correctly parse a few spells, it's able to get >90% of the spells into a very clean JSON format. That JSON file is then used by `back-end` (written in Go) to expose a spellbook-filtering function. That filtering function is then called by the `front-end` (written in JS) to allow the user to filter down to the specific spells which are available for their class & level