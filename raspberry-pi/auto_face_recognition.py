# auto_face_recognition.py

from flask import Flask, jsonify, Response, send_file
from flask_cors import CORS
import cv2, base64, requests, os, time
from picamera2 import Picamera2

app = Flask(__name__)
CORS(app)
BACKEND_URL = "http://10.20.32.55:8000/face/trigger-verify" # Replace with your backend URL

# Haar cascade for face detection
cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

# Picamera2 setup
picam2 = Picamera2()
picam2.configure(picam2.create_preview_configuration(main={"size": (640, 480)}))
picam2.start()

DEBUG_PATH = "/tmp/last_capture.jpg"


def gen_frames():
    """Serve an MJPEG stream with a green box around each detected face."""
    while True:
        frame = picam2.capture_array()
        bgr   = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        gray  = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

        # Detect faces
        faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        # Draw a dynamic green rectangle around each face
        for (x, y, w, h) in faces:
            cv2.rectangle(bgr, (x, y), (x+w, y+h), (0, 255, 0), 2)

        # Encode to JPEG for streaming
        ret, jpeg = cv2.imencode('.jpg', bgr)
        if not ret:
            continue

        frame_bytes = jpeg.tobytes()
        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' +
            frame_bytes +
            b'\r\n'
        )


@app.route('/video_feed')
def video_feed():
    return Response(
        gen_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


@app.route('/capture', methods=['POST'])
def capture():
    """
    Wait up to 5s for a clear single-face frame (>=100px), then capture it.
    Falls back to the last frame if no "good" shot found.
    """
    best_frame = None
    start = time.time()

    while time.time() - start < 5:
        frame = picam2.capture_array()
        bgr   = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        gray  = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

        # If exactly one sufficiently large face, grab it
        if len(faces) == 1:
            x, y, w, h = faces[0]
            if w >= 100 and h >= 100:
                best_frame = bgr
                break

        time.sleep(0.1)

    # fallback to last frame
    if best_frame is None:
        frame = picam2.capture_array()
        best_frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

    # encode to JPEG
    ok, img_enc = cv2.imencode('.jpg', best_frame)
    if not ok:
        return jsonify({"status": "JPEG encode failed"}), 500

    # save for debug
    os.makedirs(os.path.dirname(DEBUG_PATH), exist_ok=True)
    with open(DEBUG_PATH, "wb") as f:
        f.write(img_enc.tobytes())

    # send Base64 to backend
    b64 = base64.b64encode(img_enc).decode()
    try:
        resp = requests.post(BACKEND_URL, json={"image_data": b64}, timeout=10)
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/last_image')
def last_image():
    """Fetch the last captured JPEG for debugging."""
    if not os.path.exists(DEBUG_PATH):
        return jsonify({"error": "No capture yet"}), 404
    return send_file(DEBUG_PATH, mimetype='image/jpeg')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)