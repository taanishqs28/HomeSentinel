# raspberry-pi/server.py
from flask import Flask, jsonify
import cv2, numpy as np, base64, requests
from picamera2 import Picamera2

app = Flask(__name__)

# Your backend route for verifying face
BACKEND_URL = "http://10.20.32.55:8000/face/trigger-verify"  # change IP as needed

# Face detector
cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
picam2 = Picamera2()
picam2.configure(picam2.create_preview_configuration(main={"size": (640, 480)}))
picam2.start()

@app.route("/capture", methods=["POST"])
def capture():
    print("Trigger received. Capturing frame...")
    frame = picam2.capture_array()
    bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    faces = cascade.detectMultiScale(gray, 1.1, 5)
    if len(faces) == 0:
        return jsonify({"status": "No face detected"}), 400

    _, img_encoded = cv2.imencode('.jpg', bgr)
    b64_image = base64.b64encode(img_encoded).decode()
    try:
        response = requests.post(BACKEND_URL, json={"image_data": b64_image})
        return jsonify(response.json())
    except Exception as e:
        print("Error sending to backend:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)  # Accessible within local network
