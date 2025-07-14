// Data generation utility for simulation
export const generateNetworkData = () => {
  const connectionTypes = ["4g", "3g", "2g", "slow-2g"];
  const randomType =
    connectionTypes[Math.floor(Math.random() * connectionTypes.length)];

  return {
    effectiveType: randomType,
    downlink: Math.random() * 10 + 0.5, // 0.5 to 10.5 Mbps
    rtt: Math.floor(Math.random() * 200) + 50, // 50 to 250 ms
    saveData: Math.random() > 0.8, // 20% chance of save data mode
  };
};

export const generateUsageData = () => {
  return {
    timestamp: Date.now(),
    usage: Math.floor(Math.random() * 100), // 0 to 100 MB
    speed: Math.random() * 10 + 0.5,
    location: "unknown",
  };
};

export const generateAlert = (usage, threshold) => {
  if (usage > threshold) {
    return {
      type: "warning",
      message: `High data usage detected: ${usage}MB`,
      timestamp: Date.now(),
      severity: usage > 90 ? "high" : "medium",
    };
  }
  return null;
};

// Format data for display
export const formatBytes = (bytes) => {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

export const formatSpeed = (mbps) => {
  if (mbps < 1) {
    return `${Math.round(mbps * 1000)} Kbps`;
  }
  return `${Math.round(mbps * 10) / 10} Mbps`;
};
