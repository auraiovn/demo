export type GarmentType = 'full-body' | 'upper-body' | 'accessory';

export type PoseState =
  | 'idle'
  | 'loading'
  | 'no-person'
  | 'partial-body'
  | 'full-body'
  | 'tracking'
  | 'error';

export interface GarmentVariant {
  readonly colour: string;
  readonly swatch: string;
  readonly garmentAsset: string;
}

export interface VirtualTryOnProduct {
  readonly productId: string;
  readonly productName: string;
  readonly garmentType: GarmentType;
  readonly colour: string;
  readonly size?: string;
  readonly garmentAsset: string;
}

export interface PoseLandmark {
  readonly x: number;
  readonly y: number;
  readonly z?: number;
  readonly visibility?: number;
}

export interface PoseAssessment {
  readonly state: Exclude<PoseState, 'idle' | 'loading' | 'error'>;
  readonly guidance: string;
  readonly confidence: number;
  readonly landmarks: readonly PoseLandmark[];
}

export interface FitAdjustments {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly scaleX: number;
  readonly scaleY: number;
}

export interface GarmentGeometry {
  readonly centerX: number;
  readonly topY: number;
  readonly width: number;
  readonly height: number;
  readonly rotation: number;
}

export const DEFAULT_FIT_ADJUSTMENTS: FitAdjustments = {
  offsetX: 0,
  offsetY: 0,
  scaleX: 1,
  scaleY: 1,
};
