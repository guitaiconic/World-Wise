import { createContext, useContext } from "react";
import { useEffect, useReducer } from "react";

const CitiesContext = createContext();
const BASE_URL = "http://localhost:9000";

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoading: true,
      };
    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };

    case "city/loaded":
      return {
        ...state,
        isLoading: false,
        currentCity: action.payload,
      };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
      };

    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(
    reducer,
    initialState
  );
  // const [cities, setCities] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [currentCity, setCurrentCity] = useState({});

  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        // Fetch cities data from the server
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch {
        // Alert the user if there is an error loading data
        dispatch({
          type: "rejected",
          payload: "There was an error loading cities...",
        });
      }
    }
    fetchCities();
  }, []);

  async function getCity(id) {
    dispatch({ type: "loading" });
    try {
      // Fetch the city by its id
      const res = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await res.json();
      // Set the current city state with the fetched city
      dispatch({ type: "city/loaded", payload: data });
    } catch {
      // If there was an error, display an alert message
      dispatch({
        type: "rejected",
        payload: "There was an error loading the city...",
      });
    }
  }

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      // Send the POST request to the server
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: { "Content-Type": "application/json" },
      });
      // Parse the response
      const data = await res.json();
      // Add the new city to the cities state
      dispatch({ type: "city/created", payload: data });
    } catch {
      // If there was an error, display an alert message
      dispatch({
        type: "rejected",
        payload: "There was an error creating the city...",
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      // Send the DELETE request to the server
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      // Remove the city from the cities state
      dispatch({ type: "city/deleted", payload: id });
    } catch {
      // If there was an error, display an alert message
      dispatch({
        type: "rejected",
        payload: "There was an error deleting the city...",
      });
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
