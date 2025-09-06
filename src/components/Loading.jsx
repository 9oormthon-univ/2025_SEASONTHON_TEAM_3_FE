import React from "react";
import "./Loading.css";

export default function Loading({
  text = "로딩중...",
  fullScreen = false,
  size = "md", // "sm" | "md" | "lg"
}) {
  return (
    <div className={fullScreen ? "ld-overlay" : ""} aria-busy="true" aria-live="polite">
      {fullScreen && <div className="ld-backdrop" />}
      <div className={`ld-container ${fullScreen ? "ld-center" : ""}`} role="status">
        <div className={`ld-dots ld-${size}`} aria-hidden="true">
          <span /><span /><span />
        </div>
        {text && <span className="ld-text">{text}</span>}
      </div>
    </div>
  );
}
