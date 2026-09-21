import type { GarmentGeometry } from '../../../types/vto';

export function lerp(previous: number, next: number, amount = 0.25): number {
  return previous * (1 - amount) + next * amount;
}

export function smoothGeometry(
  previous: GarmentGeometry | null,
  next: GarmentGeometry,
  amount = 0.25,
): GarmentGeometry {
  if (!previous) {
    return next;
  }

  return {
    centerX: lerp(previous.centerX, next.centerX, amount),
    topY: lerp(previous.topY, next.topY, amount),
    width: lerp(previous.width, next.width, amount),
    height: lerp(previous.height, next.height, amount),
    rotation: lerp(previous.rotation, next.rotation, amount),
  };
}
