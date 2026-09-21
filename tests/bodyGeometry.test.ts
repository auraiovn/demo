import { describe, expect, it } from 'vitest';
import type { PoseLandmark } from '../src/types/vto';
import {
  assessFullBodyPose,
  calculateGarmentGeometry,
} from '../src/components/VirtualTryOn/utils/bodyGeometry';

function fullBodyLandmarks(): PoseLandmark[] {
  const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    visibility: 0,
  }));

  const points: Readonly<Record<number, PoseLandmark>> = {
    11: { x: 0.42, y: 0.22, visibility: 0.96 },
    12: { x: 0.58, y: 0.22, visibility: 0.97 },
    23: { x: 0.44, y: 0.5, visibility: 0.96 },
    24: { x: 0.56, y: 0.5, visibility: 0.96 },
    25: { x: 0.45, y: 0.7, visibility: 0.94 },
    26: { x: 0.55, y: 0.7, visibility: 0.94 },
    27: { x: 0.45, y: 0.92, visibility: 0.92 },
    28: { x: 0.55, y: 0.92, visibility: 0.92 },
  };

  for (const [index, point] of Object.entries(points)) {
    landmarks[Number(index)] = point;
  }
  return landmarks;
}

describe('assessFullBodyPose', () => {
  it('reports no person when landmarks are missing', () => {
    expect(assessFullBodyPose(undefined).state).toBe('no-person');
  });

  it('does not show a full outfit when ankles are missing', () => {
    const landmarks = fullBodyLandmarks();
    landmarks[27] = { x: 0.45, y: 0.92, visibility: 0.1 };
    expect(assessFullBodyPose(landmarks).state).toBe('partial-body');
  });

  it('enters tracking after stable full-body frames', () => {
    expect(assessFullBodyPose(fullBodyLandmarks(), 3).state).toBe('tracking');
  });
});

describe('calculateGarmentGeometry', () => {
  it('derives a positive, centred garment rectangle', () => {
    const geometry = calculateGarmentGeometry(
      fullBodyLandmarks(),
      { width: 1280, height: 720 },
      { width: 960, height: 640 },
      true,
      { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    );

    expect(geometry).not.toBeNull();
    expect(geometry?.centerX).toBeGreaterThan(400);
    expect(geometry?.centerX).toBeLessThan(560);
    expect(geometry?.width).toBeGreaterThan(100);
    expect(geometry?.height).toBeGreaterThan(300);
  });
});
