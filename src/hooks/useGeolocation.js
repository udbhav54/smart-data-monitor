import { useState, useEffect } from "react";
import {
  handleAPIError,
  isAPISupported,
  logAPIUsage,
} from "../utils/errorHandler";

// Custom hook to get the user's geolocation
export const useGeolocation = () => {
  // State for location data
  const [location, setLocation] = useState(null);
  // State for any error
  const [error, setError] = useState(null);
  // Loading flag to indicate fetching status
  const [loading, setLoading] = useState(true);
  // Flag to show if geolocation API is supported
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check API support via utility function
    const supported = isAPISupported("Geolocation");
    setIsSupported(supported);

    if (supported && "geolocation" in navigator) {
      // Options for geolocation request
      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 600000, // accept cached positions up to 10 minutes old
      };

      // Called on successful position retrieval
      const successCallback = (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(locationData);
        setError(null);
        setLoading(false);
        logAPIUsage("Geolocation", locationData);
      };

      // Called on error or permission denial
      const errorCallback = (err) => {
        const errorInfo = handleAPIError("Geolocation", err);
        setError(errorInfo);
        setLoading(false);

        // Use fallback coordinates (Bengaluru)
        setLocation({
          latitude: 12.9716,
          longitude: 77.5946,
          accuracy: 100,
          error: "Using fallback location",
        });
      };

      // Request current position
      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        options
      );
    } else {
      // If unsupported, set error and fallback immediately
      setError(handleAPIError("Geolocation", new Error("API not supported")));
      setLoading(false);
      setLocation({
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 100,
        error: "Geolocation not supported",
      });
    }
  }, []); // Run once on mount

  // Expose the data to components
  return { location, error, loading, isSupported };
};
