import React from "react";

const SectionHeader = ({
  icon: Icon,
  iconColor,
  title,
  statusDot = "status-green",
  statusText,
}) => {
  return (
    <div className="section-header">
      <h2 className="section-title">
        {Icon && <Icon style={{ marginRight: "8px", color: iconColor }} />}
        {title}
      </h2>
      <div className="status-indicator">
        <div className={`status-dot ${statusDot}`}></div>
        <span>{statusText}</span>
      </div>
    </div>
  );
};

export default SectionHeader;
