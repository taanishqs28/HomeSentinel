// Description: This component captures an image from a video feed and checks if access should be granted or denied.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GainAccess() {
  const navigate    = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [error, setError]         = useState("");

  const PI_BASE     = "http://10.20.32.94:5000";
  const CAPTURE_URL = `${PI_BASE}/capture`;
  const VIDEO_FEED  = `${PI_BASE}/video_feed`;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerCapture();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []); // no dependencies needed here

  const triggerCapture = async () => {
    try {
      const res = await fetch(CAPTURE_URL, { method: "POST" });
      console.log("/capture HTTP status:", res.status);

      // 1) grab the exact response body as text
      const raw = await res.text();
      console.log("/capture RAW text:", raw);

      // 2) parse it into JSON
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        console.warn("raw response wasn't valid JSON, falling back to res.json()");
        data = await res.json();
      }
      console.log("/capture parsed JSON:", data);

      // 3) normalize the status and decide
      const status = (data.status || "").toString().trim().toLowerCase();
      if (status === "access granted") {
        console.log("navigating to /access-granted");
        return navigate("/access-granted", { state: { user: data.user } });
      }

      console.warn("🔒 navigating to /access-denied (status was)", data.status);
      navigate("/access-denied");
    } catch (err) {
      console.error("triggerCapture error:", err);
      setError("Capture failed. Access denied.");
      navigate("/access-denied");
    }
  };

  return (
    <div style={{ textAlign: "center", paddingTop: 40 }}>
      <h2>
        Capturing in {countdown} second
        {countdown !== 1 && "s"}…
      </h2>
      <img
        src={VIDEO_FEED}
        alt="Camera preview"
        width={640}
        height={480}
        style={{ borderRadius: 8, marginTop: 20 }}
      />
      {error && (
        <p style={{ color: "red", marginTop: 20 }}>{error}</p>
      )}
    </div>
  );
}
