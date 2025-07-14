// Error handling utility for Web APIs
export const handleAPIError = (apiName, error) => {
  const errorMessage = {
    NetworkInformation: "Network Information API not supported in this browser",
    Geolocation: "Location access denied or not available",
    IntersectionObserver: "Intersection Observer not supported",
    BackgroundTasks: "Background Tasks API not supported",
    Canvas: "Canvas API not available",
  };

  console.error(`${apiName} Error:`, error);

  return {
    error: true,
    message: errorMessage[apiName] || "Unknown API error",
    details: error.message || error,
  };
};

// Check if Web API is supported
export const isAPISupported = (apiName) => {
  const checks = {
    NetworkInformation: "connection" in navigator,
    Geolocation: "geolocation" in navigator,
    IntersectionObserver: "IntersectionObserver" in window,
    BackgroundTasks: "requestIdleCallback" in window,
    Canvas: document.createElement("canvas").getContext("2d") !== null,
  };

  return checks[apiName] || false;
};

// Log API usage for debugging
export const logAPIUsage = (apiName, data) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`${apiName} API Data:`, data);
  }
};
