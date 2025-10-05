// characterEngine.go
package main

import (
	"encoding/json"
	"fmt"
	"syscall/js"
)

type Race struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type InitialCharData struct {
	Races []Race `json:"races"`
}

// Sets the data that will be populated in the "Races" dropdown element
func getInitialCharData() InitialCharData {
	return InitialCharData{
		Races: []Race{
			{"Human", "Couldn't get more boring than this"},
			{"Elf", "If you want a higher-than-thou attitude"},
			{"Dwarf", "If you like to go drinking with your friends"},
		},
	}
}

// Function to be called by JavaScript to fetch initial element data
func fetchInitialCharData(this js.Value, inputs []js.Value) interface{} {
	fmt.Println("fetchInitialCharData called from JavaScript")
	charCreationModalData := getInitialCharData()

	jsonData, _ := json.Marshal(charCreationModalData)

	// Output JSON to JavaScript
	return string(jsonData)
}
