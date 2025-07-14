import React, { useRef, useEffect, useState, useCallback } from "react";
import { Activity, BarChart3, TrendingUp } from "lucide-react";
import { SectionWrapper, SectionHeader, StatBox } from "./common";
import "../styles/components/common.css";
import "../styles/components/DataChart.css";

const DataChart = ({ networkInfo, visibleSections }) => {
  const canvasRef = useRef(null);
  const [dataPoints, setDataPoints] = useState([]);
  const [chartStats, setChartStats] = useState({});
  const [currentNetworkSpeed, setCurrentNetworkSpeed] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleSpeedUpdate = (event) => {
      setCurrentNetworkSpeed(event.detail.speed);
    };

    window.addEventListener("networkSpeedUpdate", handleSpeedUpdate);
    if (window.networkSpeed) {
      setCurrentNetworkSpeed(window.networkSpeed);
    }

    return () => {
      window.removeEventListener("networkSpeedUpdate", handleSpeedUpdate);
    };
  }, []);

  const updateStats = useCallback(() => {
    if (dataPoints.length === 0) return;

    const currentUsage = dataPoints[dataPoints.length - 1]?.usage || 0;
    const averageUsage =
      dataPoints.reduce((sum, point) => sum + point.usage, 0) /
      dataPoints.length;
    const maxUsage = Math.max(...dataPoints.map((point) => point.usage));
    const averageSpeed =
      dataPoints.reduce((sum, point) => sum + point.speed, 0) /
      dataPoints.length;

    setChartStats({
      currentUsage: currentUsage.toFixed(1),
      averageUsage: averageUsage.toFixed(1),
      maxUsage: maxUsage.toFixed(1),
      averageSpeed: averageSpeed.toFixed(2),
      dataPoints: dataPoints.length,
    });
  }, [dataPoints]);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#f8fafc");
    gradient.addColorStop(1, "#e2e8f0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    if (dataPoints.length < 2) return;

    const maxSpeed = Math.max(...dataPoints.map((p) => p.speed), 60);

    // Draw lines and points
    dataPoints.forEach((point, index) => {
      const x = (width / (dataPoints.length - 1)) * index;
      const usageY = height - (point.usage / 100) * height;
      const speedY = height - (point.speed / maxSpeed) * height;

      // Usage line (blue)
      if (index > 0) {
        const prevX = (width / (dataPoints.length - 1)) * (index - 1);
        const prevUsageY =
          height - (dataPoints[index - 1].usage / 100) * height;
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(prevX, prevUsageY);
        ctx.lineTo(x, usageY);
        ctx.stroke();

        // Speed line (green)
        const prevSpeedY =
          height - (dataPoints[index - 1].speed / maxSpeed) * height;
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(prevX, prevSpeedY);
        ctx.lineTo(x, speedY);
        ctx.stroke();
      }

      // Points
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(x, usageY, 4, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(x, speedY, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Labels
    ctx.font = "12px Arial";
    ctx.fillStyle = "#6b7280";
    for (let i = 0; i <= 5; i++) {
      const y = height - (height / 5) * i;
      const value = (100 / 5) * i;
      ctx.fillText(`${value}`, 5, y - 5);
    }
  }, [dataPoints]);

  useEffect(() => {
    if (!isInitialized) {
      const initialData = Array.from({ length: 10 }, (_, i) => {
        const baseSpeed = currentNetworkSpeed || Math.random() * 10;
        const speed = baseSpeed + (Math.random() - 0.5) * 5;
        const usage = Math.min(
          100,
          Math.max(10, speed * 1.5 + Math.random() * 20)
        );

        return {
          time: new Date(Date.now() - (9 - i) * 30000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          usage: usage,
          speed: Math.max(0, speed),
          timestamp: Date.now() - (9 - i) * 30000,
        };
      });
      setDataPoints(initialData);
      setIsInitialized(true);
    }
  }, [currentNetworkSpeed, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const generateDataPoint = () => {
      const baseSpeed =
        currentNetworkSpeed || networkInfo.downlink || Math.random() * 10;
      const speed = baseSpeed + (Math.random() - 0.5) * 5;
      const usage = Math.min(
        100,
        Math.max(10, speed * 1.5 + Math.random() * 20)
      );

      const newPoint = {
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        usage: usage,
        speed: Math.max(0, speed),
        timestamp: Date.now(),
      };

      setDataPoints((prev) => [...prev.slice(-19), newPoint]);
    };

    const interval = setInterval(generateDataPoint, 3000);
    return () => clearInterval(interval);
  }, [currentNetworkSpeed, networkInfo.downlink, isInitialized]);

  useEffect(() => {
    if (canvasRef.current && dataPoints.length > 0) {
      drawChart();
      updateStats();
    }
  }, [dataPoints, drawChart, updateStats]);

  const statBoxes = [
    {
      icon: BarChart3,
      title: "Current",
      value: `${chartStats.currentUsage}MB`,
      className: "bg-blue",
      iconColor: "#3b82f6",
    },
    {
      icon: TrendingUp,
      title: "Average",
      value: `${chartStats.averageUsage}MB`,
      className: "bg-green",
      iconColor: "#10b981",
    },
    {
      icon: Activity,
      title: "Peak",
      value: `${chartStats.maxUsage}MB`,
      className: "bg-red",
      iconColor: "#ef4444",
    },
    {
      icon: BarChart3,
      title: "Speed",
      value: `${chartStats.averageSpeed} Mbps`,
      className: "bg-purple",
      iconColor: "#8b5cf6",
    },
    {
      icon: Activity,
      title: "Points",
      value: chartStats.dataPoints,
      className: "bg-yellow",
      iconColor: "#f59e0b",
    },
  ];

  return (
    <SectionWrapper id="chart-section" visibleSections={visibleSections}>
      <SectionHeader
        icon={Activity}
        iconColor="#10b981"
        title="Real-time Data Usage Chart"
        statusText="Canvas Active"
      />

      <div className="chart-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={250}
          className="chart-canvas"
        />

        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color legend-color-blue"></div>
            <span className="legend-text">Data Usage (MB)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-color-green"></div>
            <span className="legend-text">Network Speed (Mbps)</span>
          </div>
        </div>
      </div>

      <div className="chart-stats">
        {statBoxes.map((stat, index) => (
          <StatBox key={index} {...stat} />
        ))}
      </div>
    </SectionWrapper>
  );
};

export default DataChart;
