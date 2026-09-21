import { useEffect, useRef, type RefObject } from 'react';
import type {
  FitAdjustments,
  PoseAssessment,
  VirtualTryOnProduct,
} from '../../types/vto';
import { VTO_DEBUG } from './constants';
import { calculateGarmentGeometry, debugLandmarkIndices } from './utils/bodyGeometry';
import { mapLandmarkToCover, type Size } from './utils/coordinateTransform';
import { smoothGeometry } from './utils/smoothing';

interface GarmentRendererProps {
  readonly canvasRef: RefObject<HTMLCanvasElement>;
  readonly stageRef: RefObject<HTMLDivElement>;
  readonly sourceSize: Size;
  readonly assessment: PoseAssessment | null;
  readonly product: VirtualTryOnProduct;
  readonly adjustments: FitAdjustments;
  readonly mirror: boolean;
  readonly fps: number;
  readonly onAssetError: (message: string | null) => void;
}

export function GarmentRenderer({
  canvasRef,
  stageRef,
  sourceSize,
  assessment,
  product,
  adjustments,
  mirror,
  fps,
  onAssetError,
}: GarmentRendererProps) {
  const garmentRef = useRef<HTMLImageElement | null>(null);
  const currentGeometryRef = useRef<ReturnType<typeof calculateGarmentGeometry>>(null);

  useEffect(() => {
    let cancelled = false;
    const garment = new Image();
    garment.decoding = 'async';
    garment.onload = () => {
      if (!cancelled) {
        garmentRef.current = garment;
        onAssetError(null);
      }
    };
    garment.onerror = () => {
      if (!cancelled) {
        garmentRef.current = null;
        onAssetError('This look is temporarily unavailable for Live Try-On.');
      }
    };
    garment.src = product.garmentAsset;

    return () => {
      cancelled = true;
      garmentRef.current = null;
    };
  }, [onAssetError, product.garmentAsset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) {
      return;
    }

    const resize = () => {
      const bounds = stage.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
      canvas.style.width = `${bounds.width}px`;
      canvas.style.height = `${bounds.height}px`;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [canvasRef, stageRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let animationFrame = 0;

    const draw = () => {
      const context = canvas.getContext('2d');
      if (!context) {
        return;
      }

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = {
        width: canvas.width / pixelRatio,
        height: canvas.height / pixelRatio,
      };
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, viewport.width, viewport.height);

      const garment = garmentRef.current;
      const canRender =
        assessment &&
        (assessment.state === 'full-body' || assessment.state === 'tracking') &&
        garment;

      if (canRender) {
        const target = calculateGarmentGeometry(
          assessment.landmarks,
          sourceSize,
          viewport,
          mirror,
          adjustments,
        );

        if (target && garment) {
          const smoothed = smoothGeometry(currentGeometryRef.current, target, 0.25);
          currentGeometryRef.current = smoothed;

          context.save();
          context.translate(smoothed.centerX, smoothed.topY + smoothed.height / 2);
          context.rotate(smoothed.rotation);
          if (mirror) {
            context.scale(-1, 1);
          }
          context.globalAlpha = 0.96;
          context.drawImage(
            garment,
            -smoothed.width / 2,
            -smoothed.height / 2,
            smoothed.width,
            smoothed.height,
          );
          context.restore();

          if (VTO_DEBUG) {
            context.save();
            context.strokeStyle = '#6B1028';
            context.lineWidth = 1;
            context.strokeRect(
              smoothed.centerX - smoothed.width / 2,
              smoothed.topY,
              smoothed.width,
              smoothed.height,
            );
            context.fillStyle = '#ffffff';
            context.font = '12px monospace';
            context.fillText(`Pose ${Math.round(assessment.confidence * 100)}%`, 12, 20);
            context.fillText(`${fps} detection FPS`, 12, 38);
            for (const index of debugLandmarkIndices) {
              const landmark = assessment.landmarks[index];
              if (!landmark) {
                continue;
              }
              const point = mapLandmarkToCover(
                landmark,
                sourceSize,
                viewport,
                mirror,
              );
              context.beginPath();
              context.arc(point.x, point.y, 3, 0, Math.PI * 2);
              context.fill();
            }
            context.restore();
          }
        }
      } else {
        currentGeometryRef.current = null;
      }

      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationFrame);
      const context = canvas.getContext('2d');
      context?.clearRect(0, 0, canvas.width, canvas.height);
      currentGeometryRef.current = null;
    };
  }, [
    adjustments,
    assessment,
    canvasRef,
    fps,
    mirror,
    sourceSize,
  ]);

  return null;
}
