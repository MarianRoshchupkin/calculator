import sys
import cv2
import numpy as np
import json
from rtmlib import Wholebody, draw_skeleton
import base64
from io import BytesIO

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    return np.degrees(angle)

# Decode base64 image frame
def decode_image(base64_data):
    img_data = base64.b64decode(base64_data)
    np_arr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

def main(frame_data):
    # Decode the image
    frame = decode_image(frame_data)

    # Setup the AI model (adjust device/backend as needed)
    device = 'cuda'  # or 'cpu'
    backend_mode = 'onnxruntime'
    wholebody = Wholebody(mode='balanced', backend=backend_mode, device=device)

    # Confidence threshold
    kpt_thr = 0.5

    # Run pose estimation
    keypoints, scores = wholebody(frame)

    # If there are multiple people, take the first one:
    if isinstance(keypoints, (list, np.ndarray)) and np.array(keypoints).ndim == 3:
        kp = keypoints[0]
        sc = scores[0]
    else:
        kp = keypoints
        sc = scores

    # Draw the skeleton on the image
    frame_result = draw_skeleton(frame, keypoints, scores, kpt_thr=kpt_thr)

    # Example: compute right elbow angle (using COCO whole-body indexes)
    RIGHT_SHOULDER = 6
    RIGHT_ELBOW = 8
    RIGHT_WRIST = 10

    result_data = {}
    if (sc[RIGHT_SHOULDER] > kpt_thr and sc[RIGHT_ELBOW] > kpt_thr and sc[RIGHT_WRIST] > kpt_thr):
        right_elbow_angle = calculate_angle(kp[RIGHT_SHOULDER], kp[RIGHT_ELBOW], kp[RIGHT_WRIST])
        result_data["right_elbow_angle"] = right_elbow_angle

    # Send the result back (you can also send an annotated image, etc.)
    print(json.dumps(result_data))  # This will send back the result as a JSON string

if __name__ == '__main__':
    # Get frame data from WebSocket
    frame_data = sys.stdin.read()
    main(frame_data)