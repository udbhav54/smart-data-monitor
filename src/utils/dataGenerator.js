// Functions to generate mock data for testing or demo purposes

// Generate random network connection data
export const generateNetworkData = () => {
  // Possible connection types
  const types = ["4g", "3g", "2g"];
  return {
    effectiveType: types[Math.floor(Math.random() * types.length)], // e.g. '4g'
    downlink: Math.random() * 10 + 0.5, // download speed between ~0.5 and ~10.5 Mbps
    rtt: Math.floor(Math.random() * 200) + 50, // round-trip time between 50 and 250 ms
    saveData: Math.random() > 0.8, // ~20% chance that data saver is on
  };
};

// Generate random usage statistics
export const generateUsageData = () => {
  return {
    timestamp: Date.now(), // current time in milliseconds since epoch
    usage: Math.floor(Math.random() * 100), // random usage value from 0 to 99 MB
    speed: Math.random() * 10 + 0.5, // random speed between ~0.5 and ~10.5 Mbps
    time: new Date().toLocaleTimeString(), // human-readable local time string
  };
};

// Create an alert object if usage exceeds a threshold
export const generateAlert = (usage, threshold = 80) => {
  // If usage is over threshold, return alert; otherwise, return null
  if (usage > threshold) {
    return {
      type: "warning", // general alert category
      message: `High data usage: ${usage}MB`, // descriptive message
      time: new Date().toLocaleTimeString(), // when the alert was created
      severity: usage > 90 ? "high" : "medium", // severity based on usage level
    };
  }
  return null; // no alert when usage is below threshold
};

// Format speed value into human-readable string (Mbps or Kbps)
export const formatSpeed = (mbps) => {
  if (mbps < 1) {
    // Convert Mbps to Kbps for small values, rounded to nearest whole number
    return `${Math.round(mbps * 1000)} Kbps`;
  }
  // For 1 Mbps and above, round to one decimal place
  return `${Math.round(mbps * 10) / 10} Mbps`;
};
