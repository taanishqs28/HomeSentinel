from fastapi import APIRouter, HTTPException, File, UploadFile
import dlib
import numpy as np
import cv2
from scipy.spatial.distance import cosine
from config import users_collection

router = APIRouter()

# Load Dlib models
face_rec_model = dlib.face_recognition_model_v1("dlib_face_recognition_resnet_model_v1.dat")
detector = dlib.get_frontal_face_detector()
shape_predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

@router.post("/verify-face/")
async def verify_face(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Convert to RGB and detect face
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    faces = detector(rgb_img)

    if not faces:
        raise HTTPException(status_code=400, detail="No face detected")

    # Extract face encoding
    shape = shape_predictor(rgb_img, faces[0])
    face_descriptor = face_rec_model.compute_face_descriptor(rgb_img, shape)
    input_embedding = np.array(face_descriptor)

    # KNN Search in MongoDB
    users = await users_collection.find().to_list(100)
    
    for user in users:
        stored_embedding = np.array(user["face_embedding"])
        similarity = 1 - cosine(input_embedding, stored_embedding)

        if similarity > 0.7:
            return {"status": "Access Granted", "user": user["username"]}

    return {"status": "Access Denied"}
