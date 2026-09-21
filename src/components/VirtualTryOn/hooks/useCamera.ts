import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraState = 'idle' | 'requesting' | 'active' | 'error';

function cameraErrorMessage(error: unknown): string {
  if (!window.isSecureContext) {
    return 'Camera access requires HTTPS or localhost. Upload a photo instead.';
  }

  if (!(error instanceof DOMException)) {
    return 'The camera could not be started. Upload a photo instead.';
  }

  switch (error.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera access is off. Enable camera access or upload a photo instead.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No camera was detected on this device.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'The camera is already in use by another app.';
    case 'OverconstrainedError':
      return 'This camera does not support the requested settings.';
    default:
      return 'The camera could not be started. Upload a photo instead.';
  }
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>('idle');
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setState('idle');
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setState('error');
      setError('Camera access is not supported in this browser. Upload a photo instead.');
      return;
    }

    if (!window.isSecureContext) {
      setState('error');
      setError('Camera access requires HTTPS or localhost. Upload a photo instead.');
      return;
    }

    stopCamera();
    setState('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        throw new Error('Camera view is not mounted.');
      }

      video.srcObject = stream;
      await video.play();
      setState('active');
    } catch (cameraError) {
      console.error('AURA Live camera error:', cameraError);
      stopCamera();
      setState('error');
      setError(cameraErrorMessage(cameraError));
    }
  }, [stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  return {
    videoRef,
    state,
    error,
    isActive: state === 'active',
    startCamera,
    stopCamera,
  };
}
