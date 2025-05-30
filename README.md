# HomeSentinel - Facial Recognition Home Security System

## Overview

HomeSentinel is a smart home security system that uses AI-powered facial recognition to authenticate users securely and conveniently. It eliminates the need for passwords or PINs and grants or denies access based on facial verification.

## Features

* Facial Recognition Authentication
* Encrypted User Data
* Real-time Unauthorized Access Alerts

## Tech Stack

* **Frontend:** React
* **Backend:** FastAPI (Python)
* **Database:** MongoDB
* **Face Recognition Engine:** Dlib / OpenCV

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/taanishqs28/HomeSentinel
cd HomeSentinel
```

### 2. Backend Setup

```bash
cd fastapi-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd react-frontend
npm install
npm start
```

### 4. Raspberry Pi Setup

1. Navigate to the Pi directory:

   ```bash
   cd raspberry-pi
   ```
2. **IMPORTANT:** Open the script (`auto_face_recognition.py`) and set the `BACKEND_URL` constant to point to your running backend instance. For example:

   ```python
   # auto_face_recognition.py
   BACKEND_URL = "http://<YOUR_BACKEND_IP>:8000/face/trigger-verify"
   ```
3. Install any required Python packages (if not already installed):

   ```bash
   pip install -r requirements.txt
   ```
4. Run the face recognition script:

   ```bash
   python3 auto_face_recognition.py
   ```

Now your Raspberry Pi should capture images and communicate with your backend to grant or deny access based on facial recognition.
For a live demo of the project working you can visit: https://youtu.be/PT9Fdsoap80

For any questions related to the project, please feel free to contact at taanishqsethi28@gmail.com
