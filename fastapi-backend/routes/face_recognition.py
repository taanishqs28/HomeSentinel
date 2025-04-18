# fastapi-backend/routes/face_recognition.py
from fastapi import APIRouter, HTTPException, File, UploadFile
from datetime import datetime
import numpy as np, cv2, dlib
from scipy.spatial.distance import cosine
from config import users_collection, logs_collection

router = APIRouter()

# load once
_face_rec_model  = dlib.face_recognition_model_v1("dlib_face_recognition_resnet_model_v1.dat")
_detector        = dlib.get_frontal_face_detector()
_shape_predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

@router.post("/verify-face/")
async def verify_face(file: UploadFile = File(...)):
    data = await file.read()
    img  = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    rgb  = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    faces = _detector(rgb)

    if not faces:
        await logs_collection.insert_one({
            "timestamp": datetime.utcnow(),
            "status":    "No face detected"
        })
        raise HTTPException(400, "No face detected")

    shape = _shape_predictor(rgb, faces[0])
    emb   = np.array(_face_rec_model.compute_face_descriptor(rgb, shape))

    users = await users_collection.find().to_list(100)
    for u in users:
        sim = 1 - cosine(emb, np.array(u["face_embedding"]))
        if sim > 0.7:
            await logs_collection.insert_one({
                "timestamp":  datetime.utcnow(),
                "username":   u["username"],
                "status":     "Access Granted",
                "similarity": sim
            })
            return {"status": "Access Granted", "user": u["username"]}

    await logs_collection.insert_one({
        "timestamp": datetime.utcnow(),
        "status":    "Access Denied"
    })
    return {"status": "Access Denied"}
