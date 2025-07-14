import React from "react";

const SectionWrapper = ({ id, visibleSections, className = "", children }) => {
  return (
    <div
      id={id}
      className={`card section-wrapper ${className} ${
        visibleSections.has(id) ? "visible" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default SectionWrapper;
