import requests

SERVER_URL = "http://localhost:8000/verify-face/"

def upload_image():
    image_path = "captured_face.jpg"
    with open(image_path, "rb") as image_file:
        files = {"file": image_file}
        response = requests.post(SERVER_URL, files=files)
        print(response.json())

# Upload the captured image
upload_image()
