import { useState, useEffect } from "react";
import {
  handleAPIError,
  isAPISupported,
  logAPIUsage,
} from "../utils/errorHandler";

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if Geolocation API is supported
    const supported = isAPISupported("Geolocation");
    setIsSupported(supported);

    if (supported && "geolocation" in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: parseInt(import.meta.env.VITE_LOCATION_TIMEOUT) || 10000,
        maximumAge: parseInt(import.meta.env.VITE_LOCATION_MAX_AGE) || 600000,
      };

      const successCallback = (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };

        setLocation(locationData);
        setError(null);
        setLoading(false);
        logAPIUsage("Geolocation", locationData);
      };

      const errorCallback = (err) => {
        const errorInfo = handleAPIError("Geolocation", err);
        setError(errorInfo);
        setLoading(false);

        // Set a fallback location for demo purposes
        setLocation({
          latitude: 12.9716, // Bangalore coordinates
          longitude: 77.5946,
          accuracy: 100,
          error: "Using fallback location",
        });
      };

      // Get current position
      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        options
      );

      // Watch position changes (optional)
      const watchId = navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        options
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      const errorInfo = handleAPIError(
        "Geolocation",
        new Error("API not supported")
      );
      setError(errorInfo);
      setLoading(false);

      // Fallback location
      setLocation({
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 100,
        error: "Geolocation not supported - using fallback",
      });
    }
  }, []);

  const getLocationString = () => {
    if (!location) return "Location not available";
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const getAccuracyLevel = () => {
    if (!location || !location.accuracy) return "unknown";
    if (location.accuracy < 10) return "high";
    if (location.accuracy < 100) return "medium";
    return "low";
  };

  return {
    location,
    error,
    loading,
    isSupported,
    getLocationString,
    getAccuracyLevel,
  };
};
