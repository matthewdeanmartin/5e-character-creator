package main

import (
	"encoding/json"
	"fmt"
	"syscall/js"
)

// --- Helper for Fetching & Unmarshaling ---

// fetchAndUnmarshal performs a fetch and attempts to unmarshal the JSON response
// into our Go APIResult struct. It returns a JS Promise that resolves with the
// parsed data or rejects with a detailed error.
func fetchAndUnmarshal(url string) js.Value {
	handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		resolve := args[0]
		reject := args[1]

		go func() {
			respPromise := js.Global().Call("fetch", url)

			// Chain handlers for the promise
			respPromise.Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				response := args[0]
				// 1. CHECK FOR BAD HTTP STATUS (e.g., 404 Not Found, 500 Server Error)
				if !response.Get("ok").Bool() {
					errorMsg := fmt.Sprintf("API request failed for %s: %s %s", url, response.Get("status").String(), response.Get("statusText").String())
					fmt.Println(errorMsg) // Log to Go console
					// Reject the promise, creating a new JavaScript Error object
					reject.Invoke(js.Global().Get("Error").New(errorMsg))
					return nil
				}
				// If status is OK, get the response body as plain text
				return response.Call("text")
			})).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				jsonText := args[0].String()
				// Log the raw response for easy debugging
				fmt.Printf("--- Raw API Response from %s ---\n%s\n-----------------------------------\n", url, jsonText)

				// The API nests results under a "results" key
				var apiResponse struct {
					Results []APIResult `json:"results"`
				}

				// 2. TRY TO PARSE THE JSON INTO OUR GO STRUCT
				if err := json.Unmarshal([]byte(jsonText), &apiResponse); err != nil {
					// This catches errors if the JSON format is wrong
					errorMsg := fmt.Sprintf("Error parsing JSON from %s: %v", url, err)
					fmt.Println(errorMsg) // Log detailed parsing error
					reject.Invoke(js.Global().Get("Error").New(errorMsg))
					return nil
				}

				// Success! Convert the Go struct back to a JS-friendly value
				jsResults := make([]interface{}, len(apiResponse.Results))
				for i, v := range apiResponse.Results {
					jsResults[i] = map[string]interface{}{
						"index": v.Index,
						"name":  v.Name,
						"url":   v.URL,
					}
				}
				resolve.Invoke(js.ValueOf(jsResults))
				return nil
			})).Call("catch", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				// 3. CATCH NETWORK ERRORS (API is down, DNS fails, etc.)
				jsErr := args[0]
				errorMsg := fmt.Sprintf("Network error fetching %s: %s", url, jsErr.Get("message").String())
				fmt.Println(errorMsg) // Log detailed network error
				reject.Invoke(js.Global().Get("Error").New(errorMsg))
				return nil
			}))
		}()

		return nil
	})

	return js.Global().Get("Promise").New(handler)
}

// --- JS-facing Functions (Updated) ---

func getInitialSetupData(this js.Value, args []js.Value) interface{} {
	handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		resolve := args[0]
		reject := args[1]

		go func() {
			// Use our new robust helper for each API call
			racesPromise := fetchAndUnmarshal("https://www.dnd5eapi.co/api/races")
			classesPromise := fetchAndUnmarshal("https://www.dnd5eapi.co/api/classes")

			promiseAll := js.Global().Get("Promise").Call("all", js.ValueOf([]interface{}{racesPromise, classesPromise}))

			promiseAll.Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				results := args[0]
				data := map[string]interface{}{
					"races":   results.Index(0),
					"classes": results.Index(1),
					"backgrounds": []interface{}{
						map[string]interface{}{"index": "acolyte", "name": "Acolyte"},
					},
				}
				resolve.Invoke(js.ValueOf(data))
				return nil
			})).Call("catch", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				// If any promise fails, Promise.all rejects.
				// The detailed error was already printed by our helper.
				fmt.Println("Error in getInitialSetupData: One of the initial API calls failed.")
				reject.Invoke(args[0])
				return nil
			}))
		}()
		return nil
	})
	return js.Global().Get("Promise").New(handler)
}

func getSubraces(this js.Value, args []js.Value) interface{} {
	raceIndex := args[0].String()
	url := fmt.Sprintf("https://www.dnd5eapi.co/api/races/%s/subraces", raceIndex)
	// We can use the helper directly, as it already returns a promise.
	return fetchAndUnmarshal(url)
}

func calculateModifier(this js.Value, i []js.Value) interface{} {
	score := i[0].Int()
	modifier := (score - 10) / 2
	return modifier
}

// getPointBuyCost returns the *total* point cost to get a score from a base of 8.
// Standard 5e point buy:
// - 8-13 costs 1 point per level
// - 14-17 costs 2 points per level.
// - 17-18 costs 3 points per level.
func getPointBuyCost(this js.Value, i []js.Value) interface{} {
	score := i[0].Int()
	cost := 0

	// You can't buy a score s.t. 8 < score < 18
	for s := 9; s <= score; s++ {
		if s <= 13 {
			cost += 1
		} else if s <= 17 {
			cost += 2
		} else if s == 18 {
			cost += 3
		}
	}
	return cost
}

// getPointBuyCostDelta returns the point cost to *move to* a given score.
func getPointBuyCostDelta(this js.Value, i []js.Value) interface{} {
	targetScore := i[0].Int() // This is the score you are *moving to*

	switch {
	case targetScore <= 8:
		// Cannot go below 8, cost is 0
		return 0
	case targetScore >= 9 && targetScore <= 13:
		// Moving to 9, 10, 11, 12, or 13 costs 1 point.
		return 1
	case targetScore >= 14 && targetScore <= 17:
		// Moving to 14, 15, 16, or 17 costs 2 points.
		return 2
	case targetScore == 18:
		// Moving to 18 costs 3 points.
		return 3
	default:
		// Cannot go above 18 in point buy
		return 0
	}
}

// saveCharacter saves the character JSON to the browser's localStorage.
func saveCharacter(this js.Value, i []js.Value) interface{} {
	// 1. Get the character JSON string from the JS call.
	charJSON := i[0].String()

	// 2. Get the JS 'localStorage' object from the global 'window' scope.
	localStorage := js.Global().Get("localStorage")

	// 3. Check if localStorage is available.
	if localStorage.IsUndefined() {
		fmt.Println("Error: localStorage is not available in this browser.")
		return nil
	}

	// 4. Save the data to localStorage.
	// This is the Go equivalent of: localStorage.setItem("savedCharacter", charJSON);
	localStorage.Call("setItem", "savedCharacter", charJSON)

	// 5. Log to the console for confirmation.
	fmt.Println("--- Character Saved to LocalStorage ---")
	fmt.Println(charJSON)
	fmt.Println("---------------------------------------")

	return nil
}

// loadCharacter retrieves the saved character JSON from localStorage.
func loadCharacter(this js.Value, i []js.Value) interface{} {
	localStorage := js.Global().Get("localStorage")
	if localStorage.IsUndefined() {
		fmt.Println("Error: localStorage is not available.")
		return js.ValueOf(nil)
	}

	// This is the Go equivalent of: localStorage.getItem("savedCharacter");
	savedData := localStorage.Call("getItem", "savedCharacter")

	if savedData.IsNull() {
		fmt.Println("No saved character found in localStorage.")
		return js.ValueOf(nil)
	}

	fmt.Println("--- Loaded Character from LocalStorage ---")
	return savedData
}

// --- Main Function ---
func main() {
	c := make(chan struct{})

	js.Global().Set("getInitialSetupData", js.FuncOf(getInitialSetupData))
	js.Global().Set("getSubraces", js.FuncOf(getSubraces))
	js.Global().Set("calculateModifier", js.FuncOf(calculateModifier))
	js.Global().Set("saveCharacter", js.FuncOf(saveCharacter))
	js.Global().Set("loadCharacter", js.FuncOf(loadCharacter))

	js.Global().Set("getPointBuyCost", js.FuncOf(getPointBuyCost))
	js.Global().Set("getPointBuyCostDelta", js.FuncOf(getPointBuyCostDelta))

	js.Global().Call("goWasmReady")
	<-c
}
