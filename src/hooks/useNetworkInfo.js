import { useState, useEffect } from "react";
import {
  handleAPIError,
  isAPISupported,
  logAPIUsage,
} from "../utils/errorHandler";
import { generateNetworkData } from "../utils/dataGenerator";

export const useNetworkInfo = () => {
  const [networkInfo, setNetworkInfo] = useState({});
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if Network Information API is supported
    const supported = isAPISupported("NetworkInformation");
    setIsSupported(supported);

    if (supported && "connection" in navigator) {
      try {
        const connection = navigator.connection;

        const updateNetworkInfo = () => {
          const info = {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
            type: connection.type,
          };

          setNetworkInfo(info);
          logAPIUsage("NetworkInformation", info);
        };

        // Initial update
        updateNetworkInfo();

        // Listen for changes
        connection.addEventListener("change", updateNetworkInfo);

        return () => {
          connection.removeEventListener("change", updateNetworkInfo);
        };
      } catch (err) {
        const errorInfo = handleAPIError("NetworkInformation", err);
        setError(errorInfo);
      }
    } else {
      // Fallback: simulate network data for demo purposes
      const simulateNetworkData = () => {
        const data = generateNetworkData();
        setNetworkInfo(data);
        logAPIUsage("NetworkInformation (Simulated)", data);
      };

      simulateNetworkData();
      const interval = setInterval(simulateNetworkData, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, []);

  const getConnectionQuality = () => {
    if (!networkInfo.effectiveType) return "unknown";
    const type = networkInfo.effectiveType;
    if (type === "4g") return "excellent";
    if (type === "3g") return "good";
    if (type === "2g") return "poor";
    return "fair";
  };

  return {
    networkInfo,
    error,
    isSupported,
    getConnectionQuality,
  };
};
