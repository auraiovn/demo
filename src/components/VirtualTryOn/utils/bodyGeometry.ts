import type {
  FitAdjustments,
  GarmentGeometry,
  PoseAssessment,
  PoseLandmark,
} from '../../../types/vto';
import { LANDMARK_VISIBILITY_THRESHOLD } from '../constants';
import {
  mapLandmarkToCover,
  type Point,
  type Size,
} from './coordinateTransform';

const LANDMARK_INDEX = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
} as const;

const REQUIRED_FULL_BODY_INDICES = [
  LANDMARK_INDEX.leftShoulder,
  LANDMARK_INDEX.rightShoulder,
  LANDMARK_INDEX.leftHip,
  LANDMARK_INDEX.rightHip,
  LANDMARK_INDEX.leftKnee,
  LANDMARK_INDEX.rightKnee,
  LANDMARK_INDEX.leftAnkle,
  LANDMARK_INDEX.rightAnkle,
] as const;

function visible(landmark: PoseLandmark | undefined): landmark is PoseLandmark {
  return Boolean(
    landmark &&
      (landmark.visibility ?? 0) >= LANDMARK_VISIBILITY_THRESHOLD &&
      landmark.x >= 0.02 &&
      landmark.x <= 0.98 &&
      landmark.y >= 0.01 &&
      landmark.y <= 0.99,
  );
}

function requiredLandmarks(
  landmarks: readonly PoseLandmark[],
): readonly PoseLandmark[] {
  return REQUIRED_FULL_BODY_INDICES.flatMap((index) => {
    const landmark = landmarks[index];
    return landmark ? [landmark] : [];
  });
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function assessFullBodyPose(
  landmarks: readonly PoseLandmark[] | undefined,
  consecutiveFullFrames = 0,
): PoseAssessment {
  if (!landmarks || landmarks.length === 0) {
    return {
      state: 'no-person',
      guidance: 'Step into view.',
      confidence: 0,
      landmarks: [],
    };
  }

  const shoulders = [
    landmarks[LANDMARK_INDEX.leftShoulder],
    landmarks[LANDMARK_INDEX.rightShoulder],
  ];
  const personVisible = shoulders.some(visible);
  const required = requiredLandmarks(landmarks);
  const confidence = average(required.map((landmark) => landmark.visibility ?? 0));

  if (!personVisible) {
    return {
      state: 'no-person',
      guidance: 'Step into view.',
      confidence,
      landmarks,
    };
  }

  if (required.length !== REQUIRED_FULL_BODY_INDICES.length || !required.every(visible)) {
    return {
      state: 'partial-body',
      guidance: 'Step back so we can see your full look.',
      confidence,
      landmarks,
    };
  }

  const bodyCenter = average([
    landmarks[LANDMARK_INDEX.leftShoulder]?.x ?? 0.5,
    landmarks[LANDMARK_INDEX.rightShoulder]?.x ?? 0.5,
    landmarks[LANDMARK_INDEX.leftHip]?.x ?? 0.5,
    landmarks[LANDMARK_INDEX.rightHip]?.x ?? 0.5,
  ]);

  const mirroredScreenCenter = 1 - bodyCenter;

  if (mirroredScreenCenter < 0.34) {
    return {
      state: 'full-body',
      guidance: 'Move slightly right.',
      confidence,
      landmarks,
    };
  }

  if (mirroredScreenCenter > 0.66) {
    return {
      state: 'full-body',
      guidance: 'Move slightly left.',
      confidence,
      landmarks,
    };
  }

  return {
    state: consecutiveFullFrames >= 2 ? 'tracking' : 'full-body',
    guidance: "You're in frame.",
    confidence,
    landmarks,
  };
}

function midpoint(first: Point, second: Point): Point {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
    visibility: (first.visibility + second.visibility) / 2,
  };
}

function distance(first: Point, second: Point): number {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function pointAt(
  landmarks: readonly PoseLandmark[],
  index: number,
  source: Size,
  viewport: Size,
  mirror: boolean,
): Point | null {
  const landmark = landmarks[index];
  return landmark ? mapLandmarkToCover(landmark, source, viewport, mirror) : null;
}

export function calculateGarmentGeometry(
  landmarks: readonly PoseLandmark[],
  source: Size,
  viewport: Size,
  mirror: boolean,
  adjustments: FitAdjustments,
): GarmentGeometry | null {
  const leftShoulder = pointAt(
    landmarks,
    LANDMARK_INDEX.leftShoulder,
    source,
    viewport,
    mirror,
  );
  const rightShoulder = pointAt(
    landmarks,
    LANDMARK_INDEX.rightShoulder,
    source,
    viewport,
    mirror,
  );
  const leftHip = pointAt(
    landmarks,
    LANDMARK_INDEX.leftHip,
    source,
    viewport,
    mirror,
  );
  const rightHip = pointAt(
    landmarks,
    LANDMARK_INDEX.rightHip,
    source,
    viewport,
    mirror,
  );
  const leftAnkle = pointAt(
    landmarks,
    LANDMARK_INDEX.leftAnkle,
    source,
    viewport,
    mirror,
  );
  const rightAnkle = pointAt(
    landmarks,
    LANDMARK_INDEX.rightAnkle,
    source,
    viewport,
    mirror,
  );

  if (
    !leftShoulder ||
    !rightShoulder ||
    !leftHip ||
    !rightHip ||
    !leftAnkle ||
    !rightAnkle
  ) {
    return null;
  }

  const shoulderCenter = midpoint(leftShoulder, rightShoulder);
  const hipCenter = midpoint(leftHip, rightHip);
  const ankleCenter = midpoint(leftAnkle, rightAnkle);
  const shoulderWidth = distance(leftShoulder, rightShoulder);
  const hipWidth = distance(leftHip, rightHip);
  const bodyHeight = Math.max(ankleCenter.y - shoulderCenter.y, viewport.height * 0.35);
  const torsoCenterX = (shoulderCenter.x + hipCenter.x) / 2;
  const garmentWidth = Math.max(shoulderWidth * 1.72, hipWidth * 1.55);

  return {
    centerX: torsoCenterX + adjustments.offsetX * viewport.width,
    topY: shoulderCenter.y - bodyHeight * 0.055 + adjustments.offsetY * viewport.height,
    width: garmentWidth * adjustments.scaleX,
    height: bodyHeight * 1.12 * adjustments.scaleY,
    rotation: Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x,
    ),
  };
}

export const debugLandmarkIndices = REQUIRED_FULL_BODY_INDICES;
