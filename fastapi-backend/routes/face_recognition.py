"""
This file defines API routes for enrolling and verifying face embeddings 
using the face_recognition library, enabling biometric access control.
"""


from fastapi import APIRouter, HTTPException, File, UploadFile, Depends
from datetime import datetime
import os, numpy as np, cv2, dlib
import base64
from scipy.spatial.distance import cosine
from config import users_collection, logs_collection
from services.auth_service import get_current_user

router = APIRouter(prefix="/face", tags=["face"])

# Absolute paths to .dat files
BASE_DIR        = os.path.dirname(os.path.dirname(__file__))
REC_MODEL_PATH  = os.path.join(BASE_DIR, "dlib_face_recognition_resnet_model_v1.dat")
SHAPE_PATH      = os.path.join(BASE_DIR, "shape_predictor_68_face_landmarks.dat")

# Load once
_face_rec_model  = dlib.face_recognition_model_v1(REC_MODEL_PATH)
_detector        = dlib.get_frontal_face_detector()
_shape_predictor = dlib.shape_predictor(SHAPE_PATH)

@router.post("/enroll")
async def enroll_face(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    data = await file.read()
    img  = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    rgb  = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    faces = _detector(rgb, 1)  # upsample once
    if not faces:
        raise HTTPException(400, "No face detected")
    shape = _shape_predictor(rgb, faces[0])
    emb   = list(_face_rec_model.compute_face_descriptor(rgb, shape))
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"face_embedding": emb}}
    )
    return {"message": "Face enrolled"}

@router.post("/trigger-verify")
async def trigger_verify(payload: dict):
    image_data = payload.get("image_data")
    if not image_data:
        raise HTTPException(400, "Missing image data")

    img_bytes = base64.b64decode(image_data)
    img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    faces = _detector(rgb, 1)
    if not faces:
        await logs_collection.insert_one({"timestamp": datetime.utcnow(), "status": "No face"})
        return {"status": "Access Denied", "reason": "No face detected"}

    shape = _shape_predictor(rgb, faces[0])
    emb = np.array(_face_rec_model.compute_face_descriptor(rgb, shape))

    all_users = await users_collection.find().to_list(length=None)

    best_match = None
    highest_sim = 0.0
    SIMILARITY_THRESHOLD = 0.5

    for u in all_users:
        if not u.get("face_embedding"):
            continue
        sim = 1 - cosine(emb, np.array(u["face_embedding"]))
        if sim > SIMILARITY_THRESHOLD and sim > highest_sim:
            best_match = u
            highest_sim = sim

    if best_match:
        await logs_collection.insert_one({
            "timestamp": datetime.utcnow(),
            "username": best_match["username"],
            "status": "Access Granted",
            "similarity": highest_sim
        })
        return {"status": "Access Granted", "user": best_match["username"]}

    await logs_collection.insert_one({
        "timestamp": datetime.utcnow(),
        "status": "Access Denied",
        "similarity": highest_sim
    })
    return {"status": "Access Denied"}