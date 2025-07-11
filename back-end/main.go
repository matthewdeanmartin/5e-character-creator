// main.go
package main

import (
	"encoding/json"
	// Import the embed package
	_ "embed"
	"syscall/js"
)

// The //go:embed directive tells the Go compiler to embed the contents
// of the spells.json file into the spellbookJSON variable as a string.
//
//go:embed data/spells.json
var spellbookJSON string

// Spell defines the structure for a D&D spell.
// TODO(vmartin): Fix problem where input JSON properties don't match the values fed into the JS
type Spell struct {
	Name        string   `json:"name"`
	Level       int      `json:"level"`
	School      string   `json:"school"`
	Classes     []string `json:"classes"`
	CastingTime string   `json:"castingTime"`
	Range       string   `json:"range"`
	Components  string   `json:"components"`
	Duration    string   `json:"duration"`
	Description string   `json:"description"`
}

// spellbook will hold all the available spells after parsing the JSON.
var spellbook []Spell

// loadSpellbookFromJSON parses the embedded JSON string into our slice of Spell structs.
func loadSpellbookFromJSON() {
	// Unmarshal the JSON string into the spellbook slice.
	err := json.Unmarshal([]byte(spellbookJSON), &spellbook)
	if err != nil {
		// This is a critical error, as the application can't run without spell data.
		// In a real app, you might have more robust error handling.
		println("FATAL ERROR: could not parse embedded spells.json:", err.Error())
		return
	}
	println(len(spellbook), "spells loaded successfully.")
}

// filterSpells is the function that will be called from JavaScript.
// It filters the spellbook based on the provided criteria.
func filterSpells(this js.Value, args []js.Value) interface{} {
	// Expecting three arguments: class, school, level
	if len(args) != 3 {
		return "Invalid number of arguments"
	}

	filterClass := args[0].String()
	filterSchool := args[1].String()
	filterLevel := args[2].Int()

	var filtered []Spell
	for _, spell := range spellbook {
		// Level check
		if filterLevel != -1 && spell.Level != filterLevel {
			continue
		}

		// School check
		if filterSchool != "All" && spell.School != filterSchool {
			continue
		}

		// Class check
		classMatch := false
		if filterClass == "All" {
			classMatch = true
		} else {
			for _, c := range spell.Classes {
				if c == filterClass {
					classMatch = true
					break
				}
			}
		}

		if classMatch {
			filtered = append(filtered, spell)
		}
	}

	// Convert the filtered slice of spells into a JSON string
	jsonResult, err := json.Marshal(filtered)
	if err != nil {
		return "Error marshalling JSON"
	}

	return js.ValueOf(string(jsonResult))
}

func main() {
	c := make(chan struct{}, 0)

	println("Initializing spellbook from JSON")
	// Load the spell data from the embedded JSON.
	loadSpellbookFromJSON()

	println("Registering functions as callable from JavaScript")
	// Register the function to be callable from JavaScript
	js.Global().Set("filterSpells", js.FuncOf(filterSpells))

	<-c // Keep the Go application alive
}
