import React, { useRef, useEffect } from "react";
import { Eye, Zap } from "lucide-react";
import NetworkInfo from "./components/NetworkInfo";
import LocationInfo from "./components/LocationInfo";
import DataChart from "./components/DataChart";
import APIStatus from "./components/APIStatus";
import { useNetworkInfo } from "./hooks/useNetworkInfo";
import { useGeolocation } from "./hooks/useGeolocation";
import { useIntersectionObserver } from "./hooks/useIntersectionObserver";
import { useBackgroundTasks } from "./hooks/useBackgroundTasks";

const SmartDataMonitor = () => {
  // Custom hooks
  const { networkInfo } = useNetworkInfo();
  const { location } = useGeolocation();
  const { visibleElements, observe } = useIntersectionObserver();
  const { isActive: backgroundTasksActive } = useBackgroundTasks();

  // Refs for sections
  const networkSectionRef = useRef(null);
  const chartSectionRef = useRef(null);
  const locationSectionRef = useRef(null);

  // Set up intersection observer
  useEffect(() => {
    if (networkSectionRef.current) observe(networkSectionRef.current);
    if (chartSectionRef.current) observe(chartSectionRef.current);
    if (locationSectionRef.current) observe(locationSectionRef.current);
  }, [observe]);

  const apiStatus = {
    network: "supported",
    geolocation: location && !location.error ? "supported" : "fallback",
    observer: "supported",
    background: backgroundTasksActive ? "supported" : "unsupported",
    canvas: "supported",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div className="container">
        {/* Header */}
        <div
          style={{ textAlign: "center", marginBottom: "30px", color: "white" }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Smart Data Monitor
          </h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>
            Real-time network monitoring using 5 Web APIs
          </p>
          <div
            className="flex items-center"
            style={{ justifyContent: "center", marginTop: "16px", gap: "20px" }}
          >
            <div className="flex items-center space-x-2">
              <Zap
                style={{ width: "16px", height: "16px", color: "#10b981" }}
              />
              <span style={{ fontSize: "14px" }}>
                Background Tasks:{" "}
                {backgroundTasksActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye
                style={{ width: "16px", height: "16px", color: "#0927d1ff" }}
              />
              <span style={{ fontSize: "14px" }}>
                Visible Sections: {visibleElements.size}
              </span>
            </div>
          </div>
        </div>

        {/* Components */}
        <div ref={networkSectionRef} id="network-section">
          <NetworkInfo
            networkInfo={networkInfo}
            apiStatus={apiStatus}
            visibleSections={visibleElements}
          />
        </div>

        <div ref={chartSectionRef} id="chart-section">
          <DataChart
            networkInfo={networkInfo}
            visibleSections={visibleElements}
          />
        </div>

        <div ref={locationSectionRef} id="location-section">
          <LocationInfo
            location={location}
            apiStatus={apiStatus}
            visibleSections={visibleElements}
          />
        </div>

        <APIStatus apiStatus={apiStatus} />

        {/* Project Information */}
        <div className="card">
          <h2 className="text-2xl mb-4">Project Information</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Web APIs Used:
              </h3>
              <ul style={{ fontSize: "14px", color: "#6b7280" }}>
                <li>Network Information API</li>
                <li>Geolocation API</li>
                <li>Intersection Observer API</li>
                <li>Background Tasks API</li>
                <li>Canvas API</li>
              </ul>
            </div>
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Problem Solved:
              </h3>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                Real-time network monitoring and data usage tracking for users
                with limited data plans. Helps optimize internet usage and
                prevent overage charges.
              </p>
            </div>
          </div>
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "#f3f4f6",
              borderRadius: "8px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              Built for TAP Invest Assignment - Demonstrating 5 Web APIs solving
              real-world problems
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDataMonitor;
