import React from "react";
import { Wifi, Signal, Clock, Database } from "lucide-react";

const NetworkInfo = ({ networkInfo, apiStatus, visibleSections }) => {
  const getConnectionQuality = () => {
    if (!networkInfo.effectiveType) return "unknown";
    const type = networkInfo.effectiveType;
    if (type === "4g") return "excellent";
    if (type === "3g") return "good";
    if (type === "2g") return "poor";
    return "fair";
  };

  const getStatusColor = (status) => {
    if (status === "supported") return "status-green";
    if (status === "simulated" || status === "fallback") return "status-yellow";
    return "status-red";
  };

  return (
    <div
      id="network-section"
      className="card"
      style={{
        opacity: visibleSections.has("network-section") ? 1 : 0.7,
        transform: visibleSections.has("network-section")
          ? "translateY(0)"
          : "translateY(20px)",
        transition: "all 0.5s ease",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl flex items-center">
          <Wifi style={{ marginRight: "8px", color: "#3b82f6" }} />
          Network Information
        </h2>
        <div className="flex items-center space-x-2">
          <div
            className={`status-dot ${getStatusColor(apiStatus.network)}`}
          ></div>
          <span style={{ fontSize: "14px", color: "#6b7280" }}>
            {apiStatus.network === "supported" ? "Native API" : "Simulated"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4">
        <div className="stat-box bg-blue">
          <Signal
            style={{ width: "20px", height: "20px", margin: "0 auto 8px" }}
          />
          <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Connection</h3>
          <p
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {networkInfo.effectiveType || "Unknown"}
          </p>
        </div>

        <div className="stat-box bg-green">
          <Database
            style={{ width: "20px", height: "20px", margin: "0 auto 8px" }}
          />
          <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Speed</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            {networkInfo.downlink ? networkInfo.downlink.toFixed(1) : "0"} Mbps
          </p>
        </div>

        <div className="stat-box bg-yellow">
          <Clock
            style={{ width: "20px", height: "20px", margin: "0 auto 8px" }}
          />
          <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Latency</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            {networkInfo.rtt || 0} ms
          </p>
        </div>

        <div className="stat-box bg-purple">
          <Wifi
            style={{ width: "20px", height: "20px", margin: "0 auto 8px" }}
          />
          <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Quality</h3>
          <p
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            {getConnectionQuality()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkInfo;
