# 5th Edition Character Creator Served on HTTP Webpage

## How-To

1. Install `npm` (for `front-end`), `python` (for `srd-processor`), and `go` (for `back-end`)
2. Install JS dependencies through `npm` by running `npm run setup`
3. Start the HTTP server on `localhost` by running `npm run start`
4. Navigate through your browser of choice to: http://127.0.0.1:8080/character-sheet.html
    * When you start the HTTP server, you will see a print-out similar to the following:
    ```
    $ npm run start

    > character-creator-5e@1.0.0 start
    > http-server -c-1

    Starting up http-server, serving ./
    
    [...]

    Available on:
    http://192.168.1.18:8080
    http://10.147.17.218:8080
    http://127.0.0.1:8080
    Hit CTRL-C to stop the server
    ```
    If the URL given in step #4 does not work, find `character-sheet.html` at one of the URLs in that print-out.

## Front End
The `front-end` directory contains a JS web application which is accessible over `localhost` one you start the HTTP server. This is where the UI for our 5th edition character creator exists.

## Back End
The `back-end` directory contains a Go library which is accessed natively by the JS web application over `WebAssembly`. In other words, our Go library is built as `WebAssembly` module and its exported functions are loaded directly into our JS web application. These functions allow us to perform more complex operations that would be either more cumbersome or less efficient to implement in JS.

## SRD Processor

> [!IMPORTANT]
> This module is not used in our actual web application, due to errors inherit to our best-ability to extract spell blocks from the SRD PDF.

The `srd-processor` directory contains a Python script which attempts to parse out the actual spell definitions from the SRD v5.2.1 (available for download [here](https://www.dndbeyond.com/srd) in PDF format)

This script struggles to correctly parse >10% of the spells found in the SRD. While >75% of the spells are parsed as expected into a very clean JSON format mirroring what is printed in the SRD's PDF, the errors make it difficult to rely on that output spell list.

For this reason, we have opted to use the [D&D 5th Edition SRD API](https://5e-bits.github.io/docs/). This API exposes the entirety of D&D 5th Edition's SRD Ruleset (though it does not include additional content found in other freely-available publications made by Wizards of the Coast) directly in JSON format, which is particularly convenient for our JS web application to fetch and display.