import type { VirtualTryOnProduct } from '../types/vto';

export interface WixCustomElementLike {
  setAttribute(name: string, value: string): void;
  removeAttribute?(name: string): void;
}

export function openWixVirtualTryOn(
  element: WixCustomElementLike,
  product: VirtualTryOnProduct,
): void {
  element.setAttribute('product-json', JSON.stringify(product));
  element.setAttribute('open', 'true');
}

export function closeWixVirtualTryOn(element: WixCustomElementLike): void {
  if (element.removeAttribute) {
    element.removeAttribute('open');
    return;
  }
  element.setAttribute('open', 'false');
}
