package main

// APIResult is a generic struct for D&D 5e API list endpoints.
type APIResult struct {
	Index string `json:"index"`
	Name  string `json:"name"`
	URL   string `json:"url"`
}

// ProviderResult is a generic container for an asynchronous result.
// It's useful for passing data back from Promise handlers.
type ProviderResult struct {
	Data  []APIResult
	Error error
}
