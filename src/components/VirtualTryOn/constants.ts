export const VTO_DEBUG = false;

export const POSE_DETECTION_INTERVAL_MS = 66;
export const LANDMARK_VISIBILITY_THRESHOLD = 0.55;

export const MEDIAPIPE_WASM_ROOT =
  import.meta.env.VITE_MEDIAPIPE_WASM_ROOT ??
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm';

export const MEDIAPIPE_POSE_MODEL =
  import.meta.env.VITE_POSE_MODEL_URL ??
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
