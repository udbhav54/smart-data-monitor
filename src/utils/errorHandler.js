// Error handling utility for Web APIs
export const handleAPIError = (apiName, error) => {
  const errorMessages = {
    NetworkInformation: "Network Information API not supported",
    Geolocation: "Location access denied",
    IntersectionObserver: "Intersection Observer not supported",
    BackgroundTasks: "Background Tasks API not supported",
    Canvas: "Canvas API not available",
  };

  console.error(`${apiName} Error:`, error);

  return {
    error: true,
    message: errorMessages[apiName] || "Unknown API error",
    details: error.message || error,
  };
};

export const isAPISupported = (apiName) => {
  const checks = {
    NetworkInformation: "connection" in navigator,
    Geolocation: "geolocation" in navigator,
    IntersectionObserver: "IntersectionObserver" in window,
    BackgroundTasks: "requestIdleCallback" in window,
    Canvas: !!document.createElement("canvas").getContext("2d"),
  };

  return checks[apiName] || false;
};

// DISABLED: No logging to keep console clean
// eslint-disable-next-line no-unused-vars
export const logAPIUsage = (apiName, data) => {
  // Logging disabled to prevent console spam
  // console.log(`${apiName} API:`, data);
};
