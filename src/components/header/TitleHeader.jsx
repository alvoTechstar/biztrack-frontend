import React from "react";
export default function TitleHeader({ title, subtitle, icon }) {
  return (
    <div className="header-container">
      {icon}
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
    </div>
  );
}