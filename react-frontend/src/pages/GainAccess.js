import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GainAccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState("");

  // Raspberry Pi endpoints
  const PI_BASE = "http://10.20.32.94:5000";  // adjust as needed
  const CAPTURE_URL = `${PI_BASE}/capture`;
  const VIDEO_FEED  = `${PI_BASE}/video_feed`;

  useEffect(() => {
    // Decrement countdown every second
    const intervalId = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    // After 5 seconds, trigger capture
    const timeoutId = setTimeout(async () => {
      clearInterval(intervalId);
      try {
        const res = await fetch(CAPTURE_URL, { method: "POST" });
        const data = await res.json();
        if (data.status === "Access Granted") {
          navigate("/access-granted", { state: { user: data.user } });
        } else {
          navigate("/access-denied");
        }
      } catch (e) {
        console.error(e);
        setError("Capture failed. Please try again.");
        navigate("/access-denied");
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", paddingTop: 40 }}>
      <h2>Face will be captured in {countdown} second{countdown !== 1 ? 's' : ''}...</h2>
      <div style={{ position: "relative", display: "inline-block", marginTop: 20 }}>
        <img
          src={VIDEO_FEED}
          alt="Camera preview"
          width={640}
          height={480}
          style={{ borderRadius: 8 }}
        />
      </div>
      {error && <p style={{ color: "red", marginTop: 20 }}>{error}</p>}
    </div>
  );
}
