import React from "react";
import { CheckCircle } from "lucide-react";
import { SectionWrapper, SectionHeader } from "./common";
import "../styles/components/common.css";
import "../styles/components/APIStatus.css";

const APIStatus = ({ apiStatus }) => {
  const getStatusColor = (status) => {
    if (status === "supported") return "status-green";
    if (status === "simulated" || status === "fallback") return "status-yellow";
    return "status-red";
  };

  const apis = [
    { name: "Network Info", status: apiStatus.network },
    { name: "Geolocation", status: apiStatus.geolocation },
    { name: "Intersection Observer", status: apiStatus.observer },
    { name: "Background Tasks", status: apiStatus.background },
    { name: "Canvas", status: apiStatus.canvas },
  ];

  return (
    <SectionWrapper
      id="api-status-section"
      visibleSections={new Set(["api-status-section"])}
    >
      <SectionHeader
        icon={CheckCircle}
        iconColor="#10b981"
        title="Web API Status"
        statusDot="status-green"
        statusText="All Systems"
      />

      <div className="api-status-grid">
        {apis.map((api, index) => (
          <div key={index} className="api-status-item">
            <div
              className={`api-status-dot ${getStatusColor(api.status)}`}
            ></div>
            <p className="api-status-name">{api.name}</p>
            <p className="api-status-text">{api.status || "loading"}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default APIStatus;
