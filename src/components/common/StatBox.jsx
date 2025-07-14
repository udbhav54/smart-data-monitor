import React from "react";

const StatBox = ({
  icon: Icon,
  title,
  value,
  className = "",
  iconColor,
  valueStyle = {},
}) => {
  return (
    <div className={`stat-box ${className}`}>
      {Icon && <Icon className="stat-icon" style={{ color: iconColor }} />}
      <h3 className="stat-title">{title}</h3>
      <p className="stat-value" style={valueStyle}>
        {value}
      </p>
    </div>
  );
};

export default StatBox;
