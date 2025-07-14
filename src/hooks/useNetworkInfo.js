import { useState, useEffect } from "react";
import {
  handleAPIError,
  isAPISupported,
  logAPIUsage,
} from "../utils/errorHandler";
import { generateNetworkData } from "../utils/dataGenerator";

// Custom hook to provide network connection info and quality
export const useNetworkInfo = () => {
  // Holds current network info (either real or simulated)
  const [networkInfo, setNetworkInfo] = useState({});
  // Holds error info if using real API fails or is unsupported
  const [error, setError] = useState(null);
  // Tracks whether the NetworkInformation API is supported
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports the NetworkInformation API
    const supported = isAPISupported("NetworkInformation");
    setIsSupported(supported);

    if (supported && "connection" in navigator) {
      // Try using the real NetworkInformation API
      try {
        const connection = navigator.connection;

        // Function to update state when network properties change
        const updateNetworkInfo = () => {
          const info = {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
            type: connection.type,
          };
          setNetworkInfo(info); // save in state
          logAPIUsage("NetworkInformation", info); // debug log
        };

        updateNetworkInfo(); // initial update
        connection.addEventListener("change", updateNetworkInfo);
        // cleanup listener on unmount
        return () =>
          connection.removeEventListener("change", updateNetworkInfo);
      } catch (err) {
        // If error occurs, capture it with standardized error handler
        setError(handleAPIError("NetworkInformation", err));
      }
    } else {
      // Fallback: simulate network data if API unsupported
      const simulateNetwork = () => {
        const data = generateNetworkData();
        setNetworkInfo(data);
        logAPIUsage("NetworkInformation (Simulated)", data);
      };

      simulateNetwork(); // initial simulation
      const interval = setInterval(simulateNetwork, 10000); // repeat simulation
      return () => clearInterval(interval); // cleanup simulation
    }
  }, []); // run once on mount

  // Helper function to convert effectiveType to human‑friendly quality
  const getConnectionQuality = () => {
    if (!networkInfo.effectiveType) return "unknown";
    const type = networkInfo.effectiveType;
    if (type === "4g") return "excellent";
    if (type === "3g") return "good";
    if (type === "2g") return "poor";
    return "fair";
  };

  // Expose stored values and helper function
  return { networkInfo, error, isSupported, getConnectionQuality };
};
