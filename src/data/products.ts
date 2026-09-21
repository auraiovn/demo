import type { Product, ProductCategory } from '../types/product';

const stoneGallery = [
  '/assets/gallery/stone-product.png',
  '/assets/gallery/stone-editorial.png',
  '/assets/gallery/sand-product.png',
  '/assets/gallery/accessory-editorial.png',
] as const;

export const products: readonly Product[] = [
  {
    id: 'sand-layering-blazer-set',
    name: 'Sand Layering Blazer Set',
    price: 1390000,
    currency: 'VND',
    category: 'tailoring',
    secondaryCategory: 'clothing',
    collection: 'Tailoring',
    image: '/assets/products/sand-layering-blazer-set.png',
    gallery: ['/assets/products/sand-layering-blazer-set.png', ...stoneGallery],
    description: 'A softly structured blazer and trouser set made for polished layering.',
    rating: 4.9,
    stock: 8,
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      {
        colour: 'Sand',
        swatch: '#d8c4ae',
        garmentAsset: '/assets/vto/sand-layering-blazer-set.png',
      },
    ],
    virtualTryOnEnabled: true,
    garmentType: 'full-body',
  },
  {
    id: 'stone-open-collar-set',
    name: 'Stone Open Collar Set',
    price: 1090000,
    currency: 'VND',
    category: 'clothing',
    collection: 'Knitwear',
    image: '/assets/products/stone-open-collar-set.png',
    gallery: stoneGallery,
    description: 'An open collar knit and straight trouser set for polished everyday dressing.',
    rating: 4.8,
    stock: 11,
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      {
        colour: 'Stone',
        swatch: '#d2d0cb',
        garmentAsset: '/assets/vto/stone-open-collar-stone.png',
      },
      {
        colour: 'Cream',
        swatch: '#eee9df',
        garmentAsset: '/assets/vto/stone-open-collar-cream.png',
      },
      {
        colour: 'Charcoal',
        swatch: '#383838',
        garmentAsset: '/assets/vto/stone-open-collar-charcoal.png',
      },
    ],
    virtualTryOnEnabled: true,
    garmentType: 'full-body',
  },
  {
    id: 'ivory-sculpt-shirt-set',
    name: 'Ivory Sculpt Shirt Set',
    price: 1190000,
    currency: 'VND',
    category: 'clothing',
    collection: 'Separates',
    image: '/assets/products/ivory-sculpt-shirt-set.png',
    gallery: ['/assets/products/ivory-sculpt-shirt-set.png', ...stoneGallery],
    description: 'A clean ivory shirt balanced by fluid, sculpted trousers.',
    rating: 4.7,
    stock: 9,
    sizes: ['XS', 'S', 'M', 'L'],
    variants: [
      {
        colour: 'Ivory',
        swatch: '#efece3',
        garmentAsset: '/assets/vto/ivory-sculpt-shirt-set.png',
      },
    ],
    virtualTryOnEnabled: true,
    garmentType: 'full-body',
  },
  {
    id: 'coral-tailored-set',
    name: 'Coral Tailored Set',
    price: 1590000,
    currency: 'VND',
    category: 'tailoring',
    secondaryCategory: 'clothing',
    collection: 'Tailoring',
    image: '/assets/products/coral-tailored-set.png',
    gallery: ['/assets/products/coral-tailored-set.png', ...stoneGallery],
    description: 'Confident coral tailoring with a precise, elongated silhouette.',
    rating: 4.8,
    stock: 6,
    sizes: ['S', 'M', 'L'],
    variants: [
      {
        colour: 'Coral',
        swatch: '#ef651f',
        garmentAsset: '/assets/vto/coral-tailored-set.png',
      },
    ],
    virtualTryOnEnabled: true,
    garmentType: 'full-body',
  },
  {
    id: 'cobalt-knit-set',
    name: 'Cobalt Knit Set',
    price: 1290000,
    currency: 'VND',
    category: 'clothing',
    collection: 'Knitwear',
    image: '/assets/products/cobalt-knit-set.png',
    gallery: ['/assets/products/cobalt-knit-set.png', ...stoneGallery],
    description: 'A saturated cobalt knit set with an easy, modern proportion.',
    rating: 4.9,
    stock: 5,
    sizes: ['S', 'M', 'L'],
    variants: [
      {
        colour: 'Cobalt',
        swatch: '#176fcf',
        garmentAsset: '/assets/vto/cobalt-knit-set.png',
      },
    ],
    virtualTryOnEnabled: true,
    garmentType: 'full-body',
  },
  {
    id: 'electric-blue-heel',
    name: 'Electric Blue Heel',
    price: 890000,
    currency: 'VND',
    category: 'accessories',
    collection: 'Footwear',
    image: '/assets/products/electric-blue-heel.png',
    gallery: ['/assets/products/electric-blue-heel.png', ...stoneGallery],
    description: 'A sculptural blue sandal with a clean architectural heel.',
    rating: 4.6,
    stock: 12,
    sizes: ['36', '37', '38', '39'],
    variants: [],
    virtualTryOnEnabled: false,
  },
  {
    id: 'duo-mini-bag',
    name: 'Duo Mini Bag',
    price: 1490000,
    currency: 'VND',
    category: 'accessories',
    collection: 'Bags',
    image: '/assets/products/duo-mini-bag.png',
    gallery: ['/assets/products/duo-mini-bag.png', ...stoneGallery],
    description: 'A playful pairing of compact quilted bags in vivid colour.',
    rating: 4.8,
    stock: 7,
    sizes: ['One size'],
    variants: [],
    virtualTryOnEnabled: false,
  },
  {
    id: 'orange-frame-sunglasses',
    name: 'Orange Frame Sunglasses',
    price: 790000,
    currency: 'VND',
    category: 'accessories',
    collection: 'Eyewear',
    image: '/assets/products/orange-frame-sunglasses.png',
    gallery: ['/assets/products/orange-frame-sunglasses.png', ...stoneGallery],
    description: 'Bold rectangular frames with warm tonal lenses.',
    rating: 4.7,
    stock: 14,
    sizes: ['One size'],
    variants: [],
    virtualTryOnEnabled: false,
  },
];

export const categoryLabels: Readonly<Record<ProductCategory, string>> = {
  'all-products': 'ALL PRODUCTS',
  clothing: 'CLOTHING',
  tailoring: 'TAILORING',
  accessories: 'ACCESSORIES',
};

export function productsForCategory(category: ProductCategory): readonly Product[] {
  if (category === 'all-products') {
    return products;
  }

  return products.filter(
    (product) =>
      product.category === category || product.secondaryCategory === category,
  );
}

export function findProduct(productId: string | undefined): Product | undefined {
  return products.find((product) => product.id === productId);
}

export function isProductCategory(value: string | undefined): value is ProductCategory {
  return (
    value === 'all-products' ||
    value === 'clothing' ||
    value === 'tailoring' ||
    value === 'accessories'
  );
}
