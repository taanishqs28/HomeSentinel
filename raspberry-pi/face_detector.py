import cv2
import requests
from picamera2 import Picamera2

SERVER_URL = "http://localhost:8000/verify-face/"

# Initialize Camera
picam2 = Picamera2()
picam2.start()

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# Capture Image
image = picam2.capture_array()
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

if len(faces) > 0:
    for (x, y, w, h) in faces:
        face_roi = gray[y:y+h, x:x+w]
        cv2.imwrite("detected_face.jpg", face_roi)
        print("Face detected and saved.")

picam2.stop()
