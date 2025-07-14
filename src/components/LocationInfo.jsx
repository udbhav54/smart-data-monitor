import React from "react";
import { MapPin } from "lucide-react";
import { SectionWrapper, SectionHeader, StatBox } from "./common";
import "../styles/components/common.css";
import "../styles/components/LocationInfo.css";

const LocationInfo = ({ location, apiStatus, visibleSections }) => {
  const getStatusColor = (status) => {
    if (status === "supported") return "status-green";
    if (status === "simulated" || status === "fallback") return "status-yellow";
    return "status-red";
  };

  const getStatusText = () => {
    if (!location) return "GPS Loading...";
    if (location.error) return "GPS Fallback";
    return "GPS Active";
  };

  const locationStats = location
    ? [
        {
          title: "Latitude",
          value: location.latitude.toFixed(6),
          className: "bg-red",
        },
        {
          title: "Longitude",
          value: location.longitude.toFixed(6),
          className: "bg-red",
        },
        {
          title: "Accuracy",
          value: `${location.accuracy.toFixed(0)}m`,
          className: "bg-red",
        },
      ]
    : [];

  return (
    <SectionWrapper id="location-section" visibleSections={visibleSections}>
      <SectionHeader
        icon={MapPin}
        iconColor="#ef4444"
        title="Location Information"
        statusDot={getStatusColor(apiStatus.geolocation)}
        statusText={getStatusText()}
      />

      {location ? (
        <div className="location-stats">
          {locationStats.map((stat, index) => (
            <StatBox key={index} {...stat} />
          ))}
        </div>
      ) : (
        <div className="location-loading">
          <p>Loading location...</p>
        </div>
      )}

      {location?.error && (
        <div className="location-error">
          <p className="location-error-text">{location.error}</p>
        </div>
      )}
    </SectionWrapper>
  );
};

export default LocationInfo;
