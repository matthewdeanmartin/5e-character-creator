package dndapi

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"character-creator/models"
)

/**
 * Fetches data from a URL and unmarshals the JSON response
 * into whatever type 'T' is provided.
 */
func fetchAndUnmarshal[T any](url string) (T, error) {
	// Zero value of type T (e.g., nil for slices, empty struct for structs).
	// Returns a typed, empty value in case of an error.
	var zeroVal T

	response, err := http.Get(url)
	if err != nil {
		return zeroVal, fmt.Errorf("failed while fetching from %s: %v", url, err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return zeroVal, fmt.Errorf("failed to make request to the API from %s: %s", url, response.Status)
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return zeroVal, fmt.Errorf("failed to read the contents of the API response from %s: %v", url, err)
	}

	var result T

	// Unmarshal the body into the address of 'result'.
	if err := json.Unmarshal(body, &result); err != nil {
		return zeroVal, fmt.Errorf("failed to parse the API response as JSON from %s: %v", url, err)
	}

	// We return the populated result.
	return result, nil
}

func getAllSummaries(url string) ([]models.ApiResult, error) {
	// Call the generic function, specifying the proper type
	resultList, err := fetchAndUnmarshal[models.ApiResultList](url)
	if err != nil {
		return nil, err
	}

	// Now, perform the logic that is *specific* to this function
	fmt.Printf("Received %d results in the API response from %s\n", resultList.Count, url)

	return resultList.Results, nil
}

const apiBaseURL = "https://www.dnd5eapi.co/api/2014/"

func getAllDetails[T any](resource string) ([]T, error) {
	var detailsList []T

	// Fetch list of all available races
	apiUrl, err := url.JoinPath(apiBaseURL, resource)
	if err != nil {
		return detailsList, fmt.Errorf("failed to put together API URL for all %s: %v", resource, err)
	}

	entries, err := getAllSummaries(apiUrl)
	if err != nil {
		return detailsList, err
	}

	// For each entry, fetch entry details
	for _, entry := range entries {
		result, err := getDetails[T](resource, entry.Index)
		if err != nil {
			return detailsList, err
		}

		// Build list of details for each entry
		detailsList = append(detailsList, result)
	}

	// Return list of all details
	return detailsList, nil
}

func getDetails[T any](resource string, index string) (T, error) {
	var detailNil T

	// Build API URL for the specified index
	detailUrl, err := url.JoinPath(apiBaseURL, resource, index)
	if err != nil {
		return detailNil, fmt.Errorf("failed to put together API URL for %s index '%s': %v", resource, index, err)
	}

	// Fetch details for the specified index
	result, err := fetchAndUnmarshal[T](detailUrl)
	if err != nil {
		return detailNil, err
	}

	return result, nil
}

// --- RACES ---

func GetRaces() ([]models.RaceResult, error) {
	var racesNil []models.RaceResult

	races, err := getAllDetails[models.RaceResult]("races")
	if err != nil {
		return racesNil, err
	}

	return races, nil
}

func GetRace(raceIndex string) (models.RaceResult, error) {
	var raceNil models.RaceResult

	race, err := getDetails[models.RaceResult]("races", raceIndex)
	if err != nil {
		return raceNil, err
	}

	return race, nil
}

// --- SUB RACES ---

func GetSubRaces() ([]models.SubRaceResult, error) {
	var subRacesNil []models.SubRaceResult

	subRaces, err := getAllDetails[models.SubRaceResult]("subraces")
	if err != nil {
		return subRacesNil, err
	}

	return subRaces, nil
}

func GetSubRace(subRaceIndex string) (models.SubRaceResult, error) {
	var subRaceNil models.SubRaceResult

	subRace, err := getDetails[models.SubRaceResult]("subraces", subRaceIndex)
	if err != nil {
		return subRaceNil, err
	}

	return subRace, nil
}

// --- CLASSES ---

func GetClasses() ([]models.ClassResult, error) {
	var classesNil []models.ClassResult

	classes, err := getAllDetails[models.ClassResult]("classes")
	if err != nil {
		return classesNil, err
	}

	return classes, nil
}

func GetClass(classIndex string) (models.ClassResult, error) {
	var classNil models.ClassResult

	dndClass, err := getDetails[models.ClassResult]("classes", classIndex)
	if err != nil {
		return classNil, err
	}

	return dndClass, nil
}
