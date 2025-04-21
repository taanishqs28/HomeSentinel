# raspberry-pi/auto_face_recognition.py
from picamera2 import Picamera2
import cv2, numpy as np, requests, time

# change to your backend’s IP or hostname
SERVER_URL = "http://10.20.32.55:8000/verify-face/" 

cascade = cv2.CascadeClassifier(cv2.data.haarcascades +
                                'haarcascade_frontalface_default.xml')

picam2 = Picamera2()
picam2.configure(picam2.create_preview_configuration(main={"size": (640, 480)}))
picam2.start()

print("Live face detection started. Press 'q' to quit.")
last_upload = 0
interval    = 5  # seconds

while True:
    frame = picam2.capture_array()
    bgr   = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    gray  = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    faces = cascade.detectMultiScale(gray, 1.1, 5)
    for (x,y,w,h) in faces:
        cv2.rectangle(bgr, (x,y),(x+w,y+h),(0,255,0),2)

    cv2.imshow("Live Face Detection", bgr)

    now = time.time()
    if len(faces) and (now - last_upload) > interval:
        _, img_encoded = cv2.imencode('.jpg', bgr)
        resp = requests.post(SERVER_URL, files={"file": img_encoded.tobytes()})
        print(resp.json())
        last_upload = now

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cv2.destroyAllWindows()
picam2.stop()
