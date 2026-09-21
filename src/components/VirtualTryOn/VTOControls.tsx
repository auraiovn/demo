import { useRef, type ChangeEvent } from 'react';
import type { FitAdjustments } from '../../types/vto';
import type { CameraState } from './hooks/useCamera';
import styles from './VirtualTryOn.module.css';

function RangeControl({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly value: number;
  readonly onChange: (value: number) => void;
}) {
  return (
    <label className={styles.rangeControl}>
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

interface VTOControlsProps {
  readonly cameraState: CameraState;
  readonly cameraActive: boolean;
  readonly adjustments: FitAdjustments;
  readonly expanded: boolean;
  readonly onStartCamera: () => void;
  readonly onStopCamera: () => void;
  readonly onToggleAdjustments: () => void;
  readonly onUpdateAdjustment: (key: keyof FitAdjustments, value: number) => void;
  readonly onResetAdjustments: () => void;
  readonly onPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function VTOControls({
  cameraState,
  cameraActive,
  adjustments,
  expanded,
  onStartCamera,
  onStopCamera,
  onToggleAdjustments,
  onUpdateAdjustment,
  onResetAdjustments,
  onPhotoUpload,
}: VTOControlsProps) {
  const uploadRef = useRef<HTMLInputElement>(null);

  return (
    <aside className={styles.controlsPanel} aria-label="Live fit controls">
      <h3>Live fit controls</h3>
      <button
        type="button"
        className={styles.primaryButton}
        onClick={onStartCamera}
        disabled={cameraState === 'requesting'}
      >
        {cameraState === 'requesting' ? 'REQUESTING CAMERA' : 'START CAMERA'}
      </button>
      <button
        type="button"
        className={styles.outlineButton}
        onClick={onStopCamera}
        disabled={!cameraActive}
      >
        STOP CAMERA
      </button>
      <button
        type="button"
        className={styles.darkButton}
        onClick={onToggleAdjustments}
        aria-expanded={expanded}
      >
        ADJUST FIT
      </button>

      {expanded ? (
        <div className={styles.fitControls}>
          <RangeControl
            label="Width"
            min={0.75}
            max={1.35}
            step={0.01}
            value={adjustments.scaleX}
            onChange={(value) => onUpdateAdjustment('scaleX', value)}
          />
          <RangeControl
            label="Length"
            min={0.75}
            max={1.35}
            step={0.01}
            value={adjustments.scaleY}
            onChange={(value) => onUpdateAdjustment('scaleY', value)}
          />
          <RangeControl
            label="Horizontal"
            min={-0.2}
            max={0.2}
            step={0.005}
            value={adjustments.offsetX}
            onChange={(value) => onUpdateAdjustment('offsetX', value)}
          />
          <RangeControl
            label="Vertical"
            min={-0.2}
            max={0.2}
            step={0.005}
            value={adjustments.offsetY}
            onChange={(value) => onUpdateAdjustment('offsetY', value)}
          />
          <button
            type="button"
            className={styles.resetButton}
            onClick={onResetAdjustments}
          >
            Recenter
          </button>
        </div>
      ) : null}

      <input
        ref={uploadRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.fileInput}
        onChange={onPhotoUpload}
        aria-label="Upload a full-body photo"
      />
      <button
        type="button"
        className={styles.uploadButton}
        onClick={() => uploadRef.current?.click()}
      >
        UPLOAD PHOTO FALLBACK
      </button>

      <p className={styles.disclaimer}>
        This preview helps you compare proportion and colour. It is not a
        measurement tool and does not predict exact physical fit.
      </p>
    </aside>
  );
}
