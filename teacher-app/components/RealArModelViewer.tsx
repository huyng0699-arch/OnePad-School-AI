"use client";

import React from "react";

type RealArModelViewerProps = {
  src: string;
  title: string;
  prompt?: string;
  poster?: string;
};

export default function RealArModelViewer({ src, title, prompt, poster }: RealArModelViewerProps) {
  React.useEffect(() => {
    void import("@google/model-viewer");
  }, []);

  return (
    <div className="real-ar-shell">
      {React.createElement("model-viewer", {
        src,
        poster,
        alt: title,
        ar: true,
        "ar-modes": "scene-viewer webxr quick-look",
        "ar-scale": "fixed",
        "camera-controls": true,
        "auto-rotate": true,
        "shadow-intensity": "1",
        "environment-image": "neutral",
        "touch-action": "pan-y",
        "xr-environment": true,
        className: "real-ar-viewer",
      }, [
        React.createElement("button", { key: "ar-button", slot: "ar-button", className: "ar-space-button" }, "View in your space"),
      ])}
      <div className="real-ar-meta">
        <strong>{title}</strong>
        {prompt ? <span>{prompt}</span> : null}
      </div>
    </div>
  );
}
