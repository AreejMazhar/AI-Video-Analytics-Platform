from ultralytics import YOLO
from pathlib import Path
import cv2
from typing import List, Dict, Any

# Absolute path to the weights — works regardless of working directory
_MODEL_PATH = Path(__file__).resolve().parents[4] / "models" / "face_detection" / "best.pt"


class FaceDetector:
    def __init__(self):
        self.model_path = str(_MODEL_PATH)
        self.model = None
        self.load_model()

    def load_model(self):
        """Load the face detection model."""
        if _MODEL_PATH.exists():
            self.model = YOLO(self.model_path)
            print(f"✅ Face detection model loaded from {self.model_path}")
        else:
            print(f"⚠️  Model not found at {self.model_path}")
            print("   Falling back to YOLOv8n (general object detection)")
            self.model = YOLO("yolov8n.pt")

    # ------------------------------------------------------------------
    # Inference helpers
    # ------------------------------------------------------------------

    def detect_faces(self, image_path: str, confidence_threshold: float = 0.5) -> List[Dict[str, Any]]:
        """Detect faces in an image file."""
        if self.model is None:
            self.load_model()
        results = self.model(image_path, conf=confidence_threshold)
        return self._parse_results(results, confidence_threshold)

    def detect_faces_frame(self, frame, confidence_threshold: float = 0.5) -> List[Dict[str, Any]]:
        """Detect faces in a raw OpenCV frame (numpy array)."""
        if self.model is None:
            self.load_model()
        results = self.model(frame, conf=confidence_threshold, verbose=False)
        return self._parse_results(results, confidence_threshold)

    # ------------------------------------------------------------------
    # Drawing helper
    # ------------------------------------------------------------------

    @staticmethod
    def draw_detections(frame, detections: List[Dict[str, Any]]):
        """
        Draw bounding boxes and confidence labels on a frame in-place.
        Returns the annotated frame.
        """
        annotated = frame.copy()
        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            conf = det["confidence"]

            # Box
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (37, 99, 235), 2)

            # Label background
            label = f"Face {conf:.0%}"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
            label_y = max(y1 - 6, th + 4)
            cv2.rectangle(annotated, (x1, label_y - th - 4), (x1 + tw + 6, label_y + 2), (37, 99, 235), -1)

            # Text
            cv2.putText(annotated, label, (x1 + 3, label_y - 2),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv2.LINE_AA)

        return annotated

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_results(results, confidence_threshold: float) -> List[Dict[str, Any]]:
        detections = []
        for r in results:
            if r.boxes is None:
                continue
            for box in r.boxes:
                conf = float(box.conf[0])
                if conf >= confidence_threshold:
                    xyxy = box.xyxy[0].tolist()
                    detections.append({
                        "bbox": [int(v) for v in xyxy],
                        "confidence": conf,
                        "class": int(box.cls[0]),
                    })
        return detections