import type { GarmentType, GarmentVariant, VirtualTryOnProduct } from './vto';

export type ProductCategory =
  | 'all-products'
  | 'clothing'
  | 'tailoring'
  | 'accessories';

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly currency: 'VND';
  readonly category: Exclude<ProductCategory, 'all-products'>;
  readonly secondaryCategory?: Exclude<ProductCategory, 'all-products'>;
  readonly collection: string;
  readonly image: string;
  readonly gallery: readonly string[];
  readonly description: string;
  readonly rating: number;
  readonly stock: number;
  readonly sizes: readonly string[];
  readonly variants: readonly GarmentVariant[];
  readonly virtualTryOnEnabled: boolean;
  readonly garmentType?: GarmentType;
}

export function formatVnd(value: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;
}

export function toVtoSelection(
  product: Product,
  colour?: string,
  size?: string,
): VirtualTryOnProduct {
  if (!product.virtualTryOnEnabled || !product.garmentType) {
    throw new Error(`${product.name} is not enabled for Virtual Try-On.`);
  }

  const variant =
    product.variants.find((candidate) => candidate.colour === colour) ??
    product.variants[0];

  if (!variant) {
    throw new Error(`${product.name} has no Virtual Try-On garment asset.`);
  }

  return {
    productId: product.id,
    productName: product.name,
    garmentType: product.garmentType,
    colour: variant.colour,
    ...(size ? { size } : {}),
    garmentAsset: variant.garmentAsset,
  };
}
