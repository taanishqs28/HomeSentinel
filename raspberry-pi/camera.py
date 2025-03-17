from picamera2 import Picamera2
import cv2
import numpy as np

# Load Face Detection Model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Initialize Camera
picam2 = Picamera2()
config = picam2.create_preview_configuration(main={"size": (640, 480)})
picam2.configure(config)
picam2.start()

print("Starting Face Detection...")

while True:
    frame = picam2.capture_array()
    frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)

    # Detect Faces
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(faces) > 0:
        print("Face detected! Capturing image...")
        image_path = "captured_face.jpg"
        cv2.imwrite(image_path, frame_bgr)
        print(f"Image saved as {image_path}")
        break  # Stop after detecting a face

print("Stopping Camera.")
picam2.stop()
cv2.destroyAllWindows()
