import React, { useState, useEffect, useRef } from "react";
import {
  Wifi,
  MapPin,
  Activity,
  Eye,
  Zap,
  AlertTriangle,
  CheckCircle,
  Signal,
  Clock,
  Database,
} from "lucide-react";

const SmartDataMonitor = () => {
  // State for all APIs
  const [networkInfo, setNetworkInfo] = useState({});
  const [location, setLocation] = useState(null);
  const [dataUsage, setDataUsage] = useState([]);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [backgroundTasksActive, setBackgroundTasksActive] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [apiStatus, setApiStatus] = useState({});

  // Refs
  const canvasRef = useRef(null);
  const observerRef = useRef(null);
  const networkSectionRef = useRef(null);
  const chartSectionRef = useRef(null);
  const locationSectionRef = useRef(null);

  // 1. Network Information API
  useEffect(() => {
    const initNetworkAPI = () => {
      if ("connection" in navigator) {
        const connection = navigator.connection;

        const updateNetworkInfo = () => {
          const info = {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
          };
          setNetworkInfo(info);

          // Generate usage data
          const usage = Math.floor(Math.random() * 100);
          const newUsage = {
            time: new Date().toLocaleTimeString(),
            usage: usage,
            speed: connection.downlink || Math.random() * 10,
          };

          setDataUsage((prev) => [...prev.slice(-19), newUsage]);

          // Generate alerts
          if (usage > 80) {
            setAlerts((prev) => [
              ...prev.slice(-4),
              {
                type: "warning",
                message: `High data usage: ${usage}MB`,
                time: new Date().toLocaleTimeString(),
              },
            ]);
          }
        };

        updateNetworkInfo();
        connection.addEventListener("change", updateNetworkInfo);
        setApiStatus((prev) => ({ ...prev, network: "supported" }));

        return () =>
          connection.removeEventListener("change", updateNetworkInfo);
      } else {
        // Fallback simulation
        const simulateNetwork = () => {
          const types = ["4g", "3g", "2g"];
          const info = {
            effectiveType: types[Math.floor(Math.random() * types.length)],
            downlink: Math.random() * 10 + 0.5,
            rtt: Math.floor(Math.random() * 200) + 50,
            saveData: false,
          };
          setNetworkInfo(info);

          const usage = Math.floor(Math.random() * 100);
          setDataUsage((prev) => [
            ...prev.slice(-19),
            {
              time: new Date().toLocaleTimeString(),
              usage: usage,
              speed: info.downlink,
            },
          ]);
        };

        simulateNetwork();
        const interval = setInterval(simulateNetwork, 5000);
        setApiStatus((prev) => ({ ...prev, network: "simulated" }));

        return () => clearInterval(interval);
      }
    };

    const cleanup = initNetworkAPI();
    return cleanup;
  }, []);

  // 2. Geolocation API
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setApiStatus((prev) => ({ ...prev, location: "supported" }));
        },
        (error) => {
          setLocation({
            latitude: 12.9716,
            longitude: 77.5946,
            accuracy: 100,
            error: "Permission denied - using Bangalore coordinates",
          });
          setApiStatus((prev) => ({ ...prev, location: "fallback" }));
        }
      );
    } else {
      setLocation({
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 100,
        error: "Geolocation not supported",
      });
      setApiStatus((prev) => ({ ...prev, location: "unsupported" }));
    }
  }, []);

  // 3. Intersection Observer API
  useEffect(() => {
    if ("IntersectionObserver" in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => new Set([...prev, entry.target.id]));
            }
          });
        },
        { threshold: 0.1 }
      );

      const sections = [
        networkSectionRef.current,
        chartSectionRef.current,
        locationSectionRef.current,
      ];
      sections.forEach((section) => {
        if (section) observerRef.current.observe(section);
      });

      setApiStatus((prev) => ({ ...prev, observer: "supported" }));

      return () => {
        if (observerRef.current) observerRef.current.disconnect();
      };
    } else {
      setApiStatus((prev) => ({ ...prev, observer: "unsupported" }));
    }
  }, []);

  // 4. Background Tasks API
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      setBackgroundTasksActive(true);

      const performBackgroundTask = () => {
        window.requestIdleCallback(() => {
          const data = {
            timestamp: Date.now(),
            memoryUsage: performance.memory
              ? performance.memory.usedJSHeapSize / 1048576
              : 0,
            connectionType: networkInfo.effectiveType || "unknown",
          };

          try {
            localStorage.setItem("backgroundData", JSON.stringify(data));
          } catch (e) {
            console.log("LocalStorage not available");
          }

          setTimeout(performBackgroundTask, 5000);
        });
      };

      performBackgroundTask();
      setApiStatus((prev) => ({ ...prev, background: "supported" }));
    } else {
      setBackgroundTasksActive(false);
      setApiStatus((prev) => ({ ...prev, background: "unsupported" }));
    }
  }, [networkInfo.effectiveType]);

  // 5. Canvas API
  useEffect(() => {
    if (canvasRef.current && dataUsage.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
          const y = (height / 10) * i;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw data line
        if (dataUsage.length > 1) {
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 3;
          ctx.beginPath();

          dataUsage.forEach((point, index) => {
            const x = (width / (dataUsage.length - 1)) * index;
            const y = height - (point.usage / 100) * height;

            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });

          ctx.stroke();

          // Draw points
          ctx.fillStyle = "#3b82f6";
          dataUsage.forEach((point, index) => {
            const x = (width / (dataUsage.length - 1)) * index;
            const y = height - (point.usage / 100) * height;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
          });
        }

        setApiStatus((prev) => ({ ...prev, canvas: "supported" }));
      }
    }
  }, [dataUsage]);

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
                style={{ width: "16px", height: "16px", color: "#3b82f6" }}
              />
              <span style={{ fontSize: "14px" }}>
                Visible Sections: {visibleSections.size}
              </span>
            </div>
          </div>
        </div>

        {/* Network Information */}
        <div
          ref={networkSectionRef}
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
              <h3 style={{ fontSize: "14px", fontWeight: "600" }}>
                Connection
              </h3>
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
                {networkInfo.downlink ? networkInfo.downlink.toFixed(1) : "0"}{" "}
                Mbps
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

        {/* Data Usage Chart */}
        <div
          ref={chartSectionRef}
          id="chart-section"
          className="card"
          style={{
            opacity: visibleSections.has("chart-section") ? 1 : 0.7,
            transform: visibleSections.has("chart-section")
              ? "translateY(0)"
              : "translateY(20px)",
            transition: "all 0.5s ease",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl flex items-center">
              <Activity style={{ marginRight: "8px", color: "#10b981" }} />
              Real-time Data Usage
            </h2>
            <div className="flex items-center space-x-2">
              <div
                className={`status-dot ${getStatusColor(apiStatus.canvas)}`}
              ></div>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>
                Canvas Active
              </span>
            </div>
          </div>

          <div className="canvas-container">
            <canvas ref={canvasRef} width={800} height={200} />
          </div>

          <div
            style={{
              marginTop: "16px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                Current Usage
              </p>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#3b82f6",
                }}
              >
                {dataUsage.length > 0
                  ? dataUsage[dataUsage.length - 1]?.usage
                  : 0}
                MB
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                Average Speed
              </p>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                {dataUsage.length > 0
                  ? (
                      dataUsage.reduce((acc, curr) => acc + curr.speed, 0) /
                      dataUsage.length
                    ).toFixed(2)
                  : 0}{" "}
                Mbps
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>Data Points</p>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#8b5cf6",
                }}
              >
                {dataUsage.length}
              </p>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div
          ref={locationSectionRef}
          id="location-section"
          className="card"
          style={{
            opacity: visibleSections.has("location-section") ? 1 : 0.7,
            transform: visibleSections.has("location-section")
              ? "translateY(0)"
              : "translateY(20px)",
            transition: "all 0.5s ease",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl flex items-center">
              <MapPin style={{ marginRight: "8px", color: "#ef4444" }} />
              Location Information
            </h2>
            <div className="flex items-center space-x-2">
              <div
                className={`status-dot ${getStatusColor(apiStatus.location)}`}
              ></div>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>
                {apiStatus.location === "supported" ? "GPS Active" : "Fallback"}
              </span>
            </div>
          </div>

          {location ? (
            <div className="grid grid-cols-3">
              <div className="stat-box bg-red">
                <h3 style={{ fontSize: "14px", fontWeight: "600" }}>
                  Latitude
                </h3>
                <p style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {location.latitude.toFixed(6)}
                </p>
              </div>
              <div className="stat-box bg-red">
                <h3 style={{ fontSize: "14px", fontWeight: "600" }}>
                  Longitude
                </h3>
                <p style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {location.longitude.toFixed(6)}
                </p>
              </div>
              <div className="stat-box bg-red">
                <h3 style={{ fontSize: "14px", fontWeight: "600" }}>
                  Accuracy
                </h3>
                <p style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {location.accuracy.toFixed(0)}m
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "20px",
                background: "#f3f4f6",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "#6b7280" }}>Loading location...</p>
            </div>
          )}

          {location?.error && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "#fef3c7",
                borderRadius: "8px",
                borderLeft: "4px solid #f59e0b",
              }}
            >
              <p style={{ color: "#92400e", fontSize: "14px" }}>
                {location.error}
              </p>
            </div>
          )}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="card">
            <h2 className="text-2xl flex items-center mb-4">
              <AlertTriangle style={{ marginRight: "8px", color: "#f59e0b" }} />
              Usage Alerts
            </h2>
            <div>
              {alerts.map((alert, index) => (
                <div key={index} className="alert">
                  <div className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <span style={{ fontSize: "12px" }}>{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Status */}
        <div className="card">
          <h2 className="text-2xl flex items-center mb-4">
            <CheckCircle style={{ marginRight: "8px", color: "#10b981" }} />
            Web API Status
          </h2>
          <div className="grid grid-cols-5">
            {[
              { name: "Network Info", status: apiStatus.network },
              { name: "Geolocation", status: apiStatus.location },
              { name: "Intersection Observer", status: apiStatus.observer },
              { name: "Background Tasks", status: apiStatus.background },
              { name: "Canvas", status: apiStatus.canvas },
            ].map((api, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                <div
                  className={`status-dot ${getStatusColor(api.status)}`}
                  style={{ margin: "0 auto 8px" }}
                ></div>
                <p style={{ fontSize: "12px", fontWeight: "600" }}>
                  {api.name}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    textTransform: "capitalize",
                  }}
                >
                  {api.status || "loading"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDataMonitor;
