import { createRoot, type Root } from 'react-dom/client';
import type { VirtualTryOnProduct } from '../types/vto';
import { VirtualTryOnModal } from '../components/VirtualTryOn/VirtualTryOnModal';

const TAG_NAME = 'aura-virtual-try-on';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGarmentType(value: unknown): value is VirtualTryOnProduct['garmentType'] {
  return value === 'full-body' || value === 'upper-body' || value === 'accessory';
}

function parseProduct(value: string | null): VirtualTryOnProduct | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !isRecord(parsed) ||
      typeof parsed.productId !== 'string' ||
      typeof parsed.productName !== 'string' ||
      !isGarmentType(parsed.garmentType) ||
      typeof parsed.colour !== 'string' ||
      typeof parsed.garmentAsset !== 'string' ||
      (parsed.size !== undefined && typeof parsed.size !== 'string')
    ) {
      return null;
    }

    return {
      productId: parsed.productId,
      productName: parsed.productName,
      garmentType: parsed.garmentType,
      colour: parsed.colour,
      ...(typeof parsed.size === 'string' ? { size: parsed.size } : {}),
      garmentAsset: parsed.garmentAsset,
    };
  } catch (error) {
    console.error('AURA Live product payload error:', error);
    return null;
  }
}

export class AuraVirtualTryOnElement extends HTMLElement {
  static get observedAttributes(): readonly string[] {
    return ['open', 'product-json'];
  }

  private reactRoot: Root | null = null;
  private mountNode: HTMLDivElement | null = null;

  connectedCallback(): void {
    if (!this.mountNode) {
      this.mountNode = document.createElement('div');
      this.mountNode.setAttribute('aria-hidden', 'true');
      this.append(this.mountNode);
      this.reactRoot = createRoot(this.mountNode);
    }
    this.style.display = 'contents';
    this.renderWidget();
  }

  disconnectedCallback(): void {
    this.reactRoot?.unmount();
    this.reactRoot = null;
    this.mountNode = null;
  }

  attributeChangedCallback(): void {
    this.renderWidget();
  }

  openTryOn(product: VirtualTryOnProduct): void {
    this.setAttribute('product-json', JSON.stringify(product));
    this.setAttribute('open', 'true');
  }

  closeTryOn(): void {
    this.removeAttribute('open');
  }

  private renderWidget(): void {
    if (!this.reactRoot) {
      return;
    }

    const isOpen = this.getAttribute('open') === 'true';
    const product = parseProduct(this.getAttribute('product-json'));

    if (!isOpen) {
      this.reactRoot.render(null);
      return;
    }

    if (!product) {
      this.dispatchEvent(
        new CustomEvent('aura-vto-error', {
          bubbles: true,
          composed: true,
          detail: { message: 'The product-json attribute is missing or invalid.' },
        }),
      );
      this.reactRoot.render(null);
      return;
    }

    this.reactRoot.render(
      <VirtualTryOnModal
        product={product}
        onClose={() => {
          this.removeAttribute('open');
          this.dispatchEvent(
            new CustomEvent('aura-vto-close', {
              bubbles: true,
              composed: true,
              detail: { productId: product.productId },
            }),
          );
        }}
      />,
    );
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, AuraVirtualTryOnElement);
}
