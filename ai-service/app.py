import base64
from typing import Literal

import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="FitAI Pose Service", version="1.0.0")
pose = mp.solutions.pose.Pose(static_image_mode=False, model_complexity=1)


class FrameRequest(BaseModel):
    image_base64: str
    exercise: Literal["Pushups", "Squats", "Jumping Jacks", "Bicep Curls"] = "Squats"


@app.get("/health")
def health():
    return {"status": "ok", "service": "fitai-pose"}


@app.post("/analyze-frame")
def analyze_frame(payload: FrameRequest):
    image = decode_image(payload.image_base64)
    results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    if not results.pose_landmarks:
        return {"detected": False, "form": "No body detected", "landmarks": []}

    landmarks = [
        {"x": item.x, "y": item.y, "z": item.z, "visibility": item.visibility}
        for item in results.pose_landmarks.landmark
    ]

    return {
        "detected": True,
        "exercise": payload.exercise,
        "form": form_hint(payload.exercise, landmarks),
        "landmarks": landmarks,
    }


def decode_image(image_base64: str):
    clean = image_base64.split(",")[-1]
    data = base64.b64decode(clean)
    array = np.frombuffer(data, np.uint8)
    return cv2.imdecode(array, cv2.IMREAD_COLOR)


def form_hint(exercise: str, landmarks: list[dict]):
    if exercise == "Squats":
        return "Keep chest tall and knees tracking over toes"
    if exercise == "Pushups":
        return "Keep shoulders, hips, and ankles in one line"
    if exercise == "Bicep Curls":
        return "Keep elbows pinned close to torso"
    return "Land softly and keep rhythm consistent"
