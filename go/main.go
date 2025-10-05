// main.go
package main

import (
	"fmt"
	"syscall/js"
)

// This function is called from JavaScript
func add(this js.Value, inputs []js.Value) interface{} {
	// Convert JS types into Go types
	val1 := inputs[0].Int()
	val2 := inputs[1].Int()

	fmt.Printf("Go's add function was called with: %d and %d\n", val1, val2)

	// syscall/js will auto-magically convert this back to a JavaScript `Number`.
	return val1 + val2
}

func main() {
	fmt.Println("Go Wasm Initialized")
	channel := make(chan bool)

	// Expose our `fetchInitialCharData` function to the global JavaScript scope.
	js.Global().Set("fetchInitialCharData", js.FuncOf(fetchInitialCharData))

	// Keep the channel running forever
	<-channel
}
