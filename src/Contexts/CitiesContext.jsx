import { createContext, useContext } from "react";
import { useState, useEffect } from "react";

const CitiesContext = createContext();
const BASE_URL = "http://localhost:9000";

function CitiesProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState({});

  useEffect(function () {
    /**
     * Fetches the list of cities from the server and updates the cities state.
     * It also manages the loading state and handles any errors that occur.
     */
    async function fetchCities() {
      try {
        // Set loading state to true while fetching data
        setIsLoading(true);
        // Fetch cities data from the server
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        // Update the cities state with the fetched data
        setCities(data);
      } catch {
        // Alert the user if there is an error loading data
        alert("There was an error loading data...");
      } finally {
        // Reset loading state after fetching data
        setIsLoading(false);
      }
    }
    fetchCities();
  }, []);

  /**
   * Fetches a city by its id and sets the currentCity state with it.
   * @param {string} id - The id of the city to fetch.
   */
  async function getCity(id) {
    try {
      setIsLoading(true);
      // Fetch the city by its id
      const res = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await res.json();
      // Set the current city state with the fetched city
      setCurrentCity(data);
    } catch {
      // If there was an error, display an alert message
      alert("There was an error loading data...");
    } finally {
      // Hide the spinner
      setIsLoading(false);
    }
  }

  /**
   * Creates a new city by sending a POST request to the server.
   * If the request was successful, it adds the new city to the cities state.
   * @param {Object} newCity - The new city to be created.
   */
  async function createCity(newCity) {
    try {
      // Show the spinner
      setIsLoading(true);
      // Send the POST request to the server
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: { "Content-Type": "application/json" },
      });
      // Parse the response
      const data = await res.json();
      // Add the new city to the cities state
      setCities([...cities, data]);
    } catch {
      // If there was an error, display an alert message
      alert("There was an error loading data...");
    } finally {
      // Hide the spinner
      setIsLoading(false);
    }
  }

  /**
   * Deletes a city by sending a DELETE request to the server.
   * If the request is successful, it removes the city from the cities state.
   * @param {string} id - The id of the city to be deleted.
   */
  async function deleteCity(id) {
    try {
      // Show the spinner
      setIsLoading(true);
      // Send the DELETE request to the server
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      // Remove the city from the cities state
      setCities(cities.filter((city) => city.id !== id));
    } catch {
      // If there was an error, display an alert message
      alert("There was an error deleting the city...");
    } finally {
      // Hide the spinner
      setIsLoading(false);
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

/**
 * A custom hook to access the cities state and functions from the CitiesProvider.
 */
function useCities() {
  /**
   * The context object that holds the cities state and functions.
   * @type {Object}
   */
  const context = useContext(CitiesContext);

  /**
   * If the context is undefined, it means the user is trying to use the hook outside of the CitiesProvider.
   * In this case, throw an error.
   */
  if (context === undefined) {
    throw new Error("useCities must be used within a CitiesProvider");
  }

  /**
   * Return the context object.
   */
  return context;
}

export { CitiesProvider, useCities };
