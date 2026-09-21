import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { createPortal } from 'react-dom';
import type {
  FitAdjustments,
  VirtualTryOnProduct,
} from '../../types/vto';
import { DEFAULT_FIT_ADJUSTMENTS } from '../../types/vto';
import { CameraStage } from './CameraStage';
import { VTOControls } from './VTOControls';
import { useCamera } from './hooks/useCamera';
import { useFocusTrap } from './hooks/useFocusTrap';
import { usePoseDetection } from './hooks/usePoseDetection';
import styles from './VirtualTryOn.module.css';

interface VirtualTryOnModalProps {
  readonly product: VirtualTryOnProduct;
  readonly onClose: () => void;
}

interface PhotoState {
  readonly url: string;
  readonly image: HTMLImageElement;
}

export function VirtualTryOnModal({ product, onClose }: VirtualTryOnModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraSize, setCameraSize] = useState({ width: 1280, height: 720 });
  const [photo, setPhoto] = useState<PhotoState | null>(null);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [showFitControls, setShowFitControls] = useState(false);
  const [adjustments, setAdjustments] = useState<FitAdjustments>(
    DEFAULT_FIT_ADJUSTMENTS,
  );
  const camera = useCamera();
  const pose = usePoseDetection({
    isOpen: true,
    cameraActive: camera.isActive,
    videoRef: camera.videoRef,
  });

  const close = useCallback(() => {
    camera.stopCamera();
    pose.clearAssessment();
    onClose();
  }, [camera.stopCamera, onClose, pose.clearAssessment]);

  useFocusTrap(dialogRef, close);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (!photo || pose.modelState !== 'ready') {
      return;
    }
    void pose.detectPhoto(photo.image);
  }, [photo, pose.detectPhoto, pose.modelState]);

  useEffect(
    () => () => {
      if (photo) {
        URL.revokeObjectURL(photo.url);
      }
    },
    [photo],
  );

  const sourceSize = useMemo(
    () =>
      photo
        ? { width: photo.image.naturalWidth, height: photo.image.naturalHeight }
        : cameraSize,
    [cameraSize, photo],
  );

  const statusMessage = useMemo(() => {
    if (camera.state === 'requesting') {
      return 'Requesting camera access...';
    }
    if (pose.modelState === 'loading') {
      return 'Preparing AURA Live...';
    }
    if (pose.assessment) {
      return pose.assessment.guidance;
    }
    return 'Step into view.';
  }, [camera.state, pose.assessment, pose.modelState]);

  const hasVisualSource = camera.isActive || Boolean(photo);
  const visibleError =
    assetError ?? camera.error ?? (hasVisualSource ? pose.modelError : null);

  const startCamera = useCallback(async () => {
    if (photo) {
      URL.revokeObjectURL(photo.url);
      setPhoto(null);
    }
    pose.clearAssessment();
    await camera.startCamera();
  }, [camera.startCamera, photo, pose.clearAssessment]);

  const stopCamera = useCallback(() => {
    camera.stopCamera();
    pose.clearAssessment();
  }, [camera.stopCamera, pose.clearAssessment]);

  const handlePhotoUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0];
      event.currentTarget.value = '';
      if (!file) {
        return;
      }

      camera.stopCamera();
      pose.clearAssessment();
      if (photo) {
        URL.revokeObjectURL(photo.url);
      }

      const url = URL.createObjectURL(file);
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => setPhoto({ url, image });
      image.onerror = () => {
        URL.revokeObjectURL(url);
        setAssetError('This photo could not be opened. Choose a JPG, PNG or WebP image.');
      };
      image.src = url;
    },
    [camera.stopCamera, photo, pose.clearAssessment],
  );

  const updateAdjustment = useCallback(
    (key: keyof FitAdjustments, value: number) => {
      setAdjustments((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const handleAssetError = useCallback((message: string | null) => {
    setAssetError(message);
  }, []);

  const modal = (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aura-vto-title"
        aria-describedby="aura-vto-description"
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>AURA LIVE</p>
            <h2 id="aura-vto-title">TRY IT ON</h2>
            <p className={styles.productName}>
              {product.productName}
              <span aria-hidden="true"> · </span>
              <span>{product.colour}</span>
              {product.size ? <span> · {product.size}</span> : null}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={close}
            aria-label="Close AURA Live"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className={styles.content}>
          <CameraStage
            stageRef={stageRef}
            canvasRef={canvasRef}
            videoRef={camera.videoRef}
            cameraActive={camera.isActive}
            photoUrl={photo?.url ?? null}
            sourceSize={sourceSize}
            assessment={pose.assessment}
            product={product}
            adjustments={adjustments}
            fps={pose.fps}
            statusMessage={statusMessage}
            error={visibleError}
            onVideoMetadata={(width, height) => setCameraSize({ width, height })}
            onAssetError={handleAssetError}
          />

          <VTOControls
            cameraState={camera.state}
            cameraActive={camera.isActive}
            adjustments={adjustments}
            expanded={showFitControls}
            onStartCamera={() => void startCamera()}
            onStopCamera={stopCamera}
            onToggleAdjustments={() =>
              setShowFitControls((visible) => !visible)
            }
            onUpdateAdjustment={updateAdjustment}
            onResetAdjustments={() =>
              setAdjustments(DEFAULT_FIT_ADJUSTMENTS)
            }
            onPhotoUpload={handlePhotoUpload}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
