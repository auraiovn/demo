import type { PoseLandmark } from '../../../types/vto';

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
  readonly visibility: number;
}

export function mapLandmarkToCover(
  landmark: PoseLandmark,
  source: Size,
  viewport: Size,
  mirror: boolean,
): Point {
  if (source.width <= 0 || source.height <= 0) {
    return {
      x: viewport.width / 2,
      y: viewport.height / 2,
      visibility: landmark.visibility ?? 0,
    };
  }

  const scale = Math.max(viewport.width / source.width, viewport.height / source.height);
  const renderedWidth = source.width * scale;
  const renderedHeight = source.height * scale;
  const offsetX = (viewport.width - renderedWidth) / 2;
  const offsetY = (viewport.height - renderedHeight) / 2;
  const unmirroredX = offsetX + landmark.x * renderedWidth;

  return {
    x: mirror ? viewport.width - unmirroredX : unmirroredX,
    y: offsetY + landmark.y * renderedHeight,
    visibility: landmark.visibility ?? 0,
  };
}
