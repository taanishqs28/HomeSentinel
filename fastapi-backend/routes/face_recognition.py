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

# Paths to dlib models
BASE_DIR        = os.path.dirname(os.path.dirname(__file__))
REC_MODEL_PATH  = os.path.join(BASE_DIR, "dlib_face_recognition_resnet_model_v1.dat")
SHAPE_PATH      = os.path.join(BASE_DIR, "shape_predictor_68_face_landmarks.dat")

# Load models once
_face_rec_model  = dlib.face_recognition_model_v1(REC_MODEL_PATH)
_detector        = dlib.get_frontal_face_detector()
_shape_predictor = dlib.shape_predictor(SHAPE_PATH)


@router.post("/enroll")
async def enroll_face(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    data = await file.read()
    img  = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    rgb  = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    faces = _detector(rgb, 1)
    if not faces:
        raise HTTPException(400, "No face detected for enrollment")

    shape = _shape_predictor(rgb, faces[0])
    emb   = list(_face_rec_model.compute_face_descriptor(rgb, shape))
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"face_embedding": emb}}
    )
    return {"message": "Face enrolled successfully"}


@router.post("/trigger-verify")
async def trigger_verify(payload: dict):
    """
    Receives {"image_data": "<base64>"}; returns status, user, and similarity.
    """
    # Decode image
    img_data = base64.b64decode(payload.get("image_data", ""))
    arr      = np.frombuffer(img_data, np.uint8)
    img      = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(400, "Invalid image data")

    # Detect face
    rgb   = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    faces = _detector(rgb, 1)
    if not faces:
        await logs_collection.insert_one({
            "timestamp": datetime.utcnow(),
            "status":    "No face detected",
            "similarity": 0.0
        })
        raise HTTPException(400, "No face detected")

    # Compute embedding
    shape = _shape_predictor(rgb, faces[0])
    emb   = np.array(_face_rec_model.compute_face_descriptor(rgb, shape))

    # Compare against all users, track best match and max sim
    all_users  = await users_collection.find().to_list(length=None)
    best_user  = None
    best_sim   = -1.0
    THRESHOLD  = 0.95   # require at least 95% similarity

    print("DEBUG: computing similarities...")
    for u in all_users:
        emb_list = u.get("face_embedding")
        if not emb_list:
            print(f"  • skipping {u['username']} (no embedding)")
            continue
        db_emb = np.array(emb_list)
        sim    = 1 - cosine(emb, db_emb)
        print(f"  • sim against {u['username']}: {sim:.4f}")

        # Always track highest similarity overall
        if sim > best_sim:
            best_sim  = sim
            best_user = u

    # Decide grant or deny based on best_sim >= THRESHOLD
    if best_user and best_sim >= THRESHOLD:
        status_text = "Access Granted"
        result      = {"status": status_text, "user": best_user["username"], "similarity": best_sim}
    else:
        status_text = "Access Denied"
        result      = {"status": status_text, "similarity": best_sim}

    # Log attempt
    log_doc = {"timestamp": datetime.utcnow(), "status": status_text, "similarity": best_sim}
    if status_text == "Access Granted":
        log_doc["username"] = best_user["username"]
    await logs_collection.insert_one(log_doc)

    print("DEBUG: response payload →", result)
    return result