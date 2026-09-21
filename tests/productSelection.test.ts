import { describe, expect, it } from 'vitest';
import { findProduct, productsForCategory } from '../src/data/products';
import { toVtoSelection } from '../src/types/product';

describe('AURA product integration', () => {
  it('loads the clicked product rather than a hard-coded product', () => {
    const sand = findProduct('sand-layering-blazer-set');
    const stone = findProduct('stone-open-collar-set');
    expect(sand).toBeDefined();
    expect(stone).toBeDefined();
    if (!sand || !stone) {
      return;
    }

    expect(toVtoSelection(sand).productId).toBe('sand-layering-blazer-set');
    expect(toVtoSelection(stone).productId).toBe('stone-open-collar-set');
  });

  it('loads the correct colour-specific garment asset', () => {
    const product = findProduct('stone-open-collar-set');
    expect(product).toBeDefined();
    if (!product) {
      return;
    }

    const selection = toVtoSelection(product, 'Charcoal', 'M');
    expect(selection.colour).toBe('Charcoal');
    expect(selection.size).toBe('M');
    expect(selection.garmentAsset).toContain('charcoal');
  });

  it('uses one category implementation for all required sections', () => {
    expect(productsForCategory('all-products').length).toBeGreaterThan(0);
    expect(productsForCategory('clothing').length).toBeGreaterThan(0);
    expect(productsForCategory('tailoring').length).toBeGreaterThan(0);
    expect(productsForCategory('accessories').length).toBeGreaterThan(0);
  });
});
