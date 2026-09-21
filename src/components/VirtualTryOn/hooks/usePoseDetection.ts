import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { PoseLandmarker } from '@mediapipe/tasks-vision';
import type { PoseAssessment, PoseLandmark } from '../../../types/vto';
import {
  MEDIAPIPE_POSE_MODEL,
  MEDIAPIPE_WASM_ROOT,
  POSE_DETECTION_INTERVAL_MS,
} from '../constants';
import { assessFullBodyPose } from '../utils/bodyGeometry';

export type ModelState = 'idle' | 'loading' | 'ready' | 'error';

interface UsePoseDetectionOptions {
  readonly isOpen: boolean;
  readonly cameraActive: boolean;
  readonly videoRef: RefObject<HTMLVideoElement>;
}

function normalizeLandmarks(
  rawLandmarks: readonly {
    readonly x: number;
    readonly y: number;
    readonly z?: number;
    readonly visibility?: number;
  }[],
): readonly PoseLandmark[] {
  return rawLandmarks.map((landmark) => ({
    x: landmark.x,
    y: landmark.y,
    ...(landmark.z === undefined ? {} : { z: landmark.z }),
    ...(landmark.visibility === undefined
      ? {}
      : { visibility: landmark.visibility }),
  }));
}

export function usePoseDetection({
  isOpen,
  cameraActive,
  videoRef,
}: UsePoseDetectionOptions) {
  const detectorRef = useRef<PoseLandmarker | null>(null);
  const fullFrameCountRef = useRef(0);
  const busyRef = useRef(false);
  const [modelState, setModelState] = useState<ModelState>('idle');
  const [modelError, setModelError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<PoseAssessment | null>(null);
  const [fps, setFps] = useState(0);

  const clearAssessment = useCallback(() => {
    fullFrameCountRef.current = 0;
    setAssessment(null);
    setFps(0);
  }, []);

  const updateAssessment = useCallback(
    (landmarks: readonly PoseLandmark[] | undefined) => {
      const next = assessFullBodyPose(landmarks, fullFrameCountRef.current);
      if (next.state === 'full-body' || next.state === 'tracking') {
        fullFrameCountRef.current += 1;
      } else {
        fullFrameCountRef.current = 0;
      }
      setAssessment(next);
      return next;
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      setModelState('idle');
      setModelError(null);
      clearAssessment();
      return;
    }

    let cancelled = false;
    setModelState('loading');
    setModelError(null);

    const initialise = async () => {
      try {
        const { FilesetResolver, PoseLandmarker } = await import(
          '@mediapipe/tasks-vision'
        );
        const fileset = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_ROOT);
        const detector = await PoseLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: MEDIAPIPE_POSE_MODEL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (cancelled) {
          detector.close();
          return;
        }

        detectorRef.current = detector;
        setModelState('ready');
      } catch (error) {
        console.error('AURA Live pose model error:', error);
        if (!cancelled) {
          setModelState('error');
          setModelError(
            'AURA Live could not prepare body tracking. Check your connection or upload a photo later.',
          );
        }
      }
    };

    void initialise();

    return () => {
      cancelled = true;
      detectorRef.current?.close();
      detectorRef.current = null;
      busyRef.current = false;
    };
  }, [clearAssessment, isOpen]);

  useEffect(() => {
    if (!cameraActive || modelState !== 'ready') {
      return;
    }

    let animationFrame = 0;
    let lastDetectionAt = 0;
    let lastVideoTime = -1;
    let frames = 0;
    let fpsWindowStarted = performance.now();

    const detect = (timestamp: number) => {
      const video = videoRef.current;
      const detector = detectorRef.current;

      if (
        video &&
        detector &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.currentTime !== lastVideoTime &&
        timestamp - lastDetectionAt >= POSE_DETECTION_INTERVAL_MS &&
        !busyRef.current
      ) {
        busyRef.current = true;
        lastDetectionAt = timestamp;
        lastVideoTime = video.currentTime;

        try {
          const result = detector.detectForVideo(video, timestamp);
          const raw = result.landmarks[0];
          updateAssessment(raw ? normalizeLandmarks(raw) : undefined);
          frames += 1;
          const elapsed = timestamp - fpsWindowStarted;
          if (elapsed >= 1000) {
            setFps(Math.round((frames * 1000) / elapsed));
            frames = 0;
            fpsWindowStarted = timestamp;
          }
        } catch (error) {
          console.error('AURA Live video detection error:', error);
        } finally {
          busyRef.current = false;
        }
      }

      animationFrame = requestAnimationFrame(detect);
    };

    animationFrame = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animationFrame);
  }, [cameraActive, modelState, updateAssessment, videoRef]);

  const detectPhoto = useCallback(
    async (image: HTMLImageElement): Promise<PoseAssessment | null> => {
      const detector = detectorRef.current;
      if (!detector || modelState !== 'ready' || busyRef.current) {
        return null;
      }

      busyRef.current = true;
      try {
        await detector.setOptions({ runningMode: 'IMAGE' });
        const result = detector.detect(image);
        const raw = result.landmarks[0];
        const next = updateAssessment(raw ? normalizeLandmarks(raw) : undefined);
        await detector.setOptions({ runningMode: 'VIDEO' });
        return next;
      } catch (error) {
        console.error('AURA Live photo detection error:', error);
        try {
          await detector.setOptions({ runningMode: 'VIDEO' });
        } catch (resetError) {
          console.error('AURA Live detector reset error:', resetError);
        }
        return null;
      } finally {
        busyRef.current = false;
      }
    },
    [modelState, updateAssessment],
  );

  return {
    modelState,
    modelError,
    assessment,
    fps,
    detectPhoto,
    clearAssessment,
  };
}
