import type { RefObject } from 'react';
import type {
  FitAdjustments,
  PoseAssessment,
  VirtualTryOnProduct,
} from '../../types/vto';
import { GarmentRenderer } from './GarmentRenderer';
import type { Size } from './utils/coordinateTransform';
import styles from './VirtualTryOn.module.css';

interface CameraStageProps {
  readonly stageRef: RefObject<HTMLDivElement>;
  readonly canvasRef: RefObject<HTMLCanvasElement>;
  readonly videoRef: RefObject<HTMLVideoElement>;
  readonly cameraActive: boolean;
  readonly photoUrl: string | null;
  readonly sourceSize: Size;
  readonly assessment: PoseAssessment | null;
  readonly product: VirtualTryOnProduct;
  readonly adjustments: FitAdjustments;
  readonly fps: number;
  readonly statusMessage: string;
  readonly error: string | null;
  readonly onVideoMetadata: (width: number, height: number) => void;
  readonly onAssetError: (message: string | null) => void;
}

export function CameraStage({
  stageRef,
  canvasRef,
  videoRef,
  cameraActive,
  photoUrl,
  sourceSize,
  assessment,
  product,
  adjustments,
  fps,
  statusMessage,
  error,
  onVideoMetadata,
  onAssetError,
}: CameraStageProps) {
  const hasVisualSource = cameraActive || Boolean(photoUrl);

  return (
    <section className={styles.cameraColumn} aria-label="Virtual try-on preview">
      <div ref={stageRef} className={styles.cameraStage}>
        <video
          ref={videoRef}
          className={cameraActive ? styles.mirroredVideo : styles.hiddenVideo}
          autoPlay
          muted
          playsInline
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            onVideoMetadata(video.videoWidth || 1280, video.videoHeight || 720);
          }}
        />

        {photoUrl ? (
          <img
            className={styles.photoPreview}
            src={photoUrl}
            alt="Uploaded full-body preview"
          />
        ) : null}

        {!hasVisualSource ? (
          <div className={styles.cameraIntro}>
            <p className={styles.introTitle}>
              YOUR LOOK
              <br />
              IN REAL TIME.
            </p>
            <p id="aura-vto-description">
              Start the camera, then step back until your full body is visible.
            </p>
          </div>
        ) : null}

        <canvas ref={canvasRef} className={styles.overlayCanvas} aria-hidden="true" />

        <GarmentRenderer
          canvasRef={canvasRef}
          stageRef={stageRef}
          sourceSize={sourceSize}
          assessment={assessment}
          product={product}
          adjustments={adjustments}
          mirror={cameraActive}
          fps={fps}
          onAssetError={onAssetError}
        />

        <div className={styles.statusPill} aria-live="polite">
          {statusMessage}
        </div>

        {error ? (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        ) : null}

        <p className={styles.privacyNote}>
          Camera processing stays in your browser where supported. AURA does not
          upload your live camera feed.
        </p>
      </div>
    </section>
  );
}
