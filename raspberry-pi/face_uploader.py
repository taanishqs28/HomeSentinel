import requests

SERVER_URL = "http://localhost:8000/verify-face/"

with open("detected_face.jpg", "rb") as image_file:
    files = {"file": image_file}
    response = requests.post(SERVER_URL, files=files)

print(response.json())
