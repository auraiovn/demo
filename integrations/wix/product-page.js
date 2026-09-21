// PRODUCT PAGE INTEGRATION
// EXISTING AURA CODE REMAINS UNCHANGED

const VTO_ELEMENT_ID = '#auraVirtualTryOn';
const TRY_BUTTON_ID = '#tryItLiveButton';

// Call this from the existing product page after its product, colour and size
// states have been resolved. It deliberately does not replace Wix product UI.
export function bindProductPageTryOn({ product, getSelectedColour, getSelectedSize }) {
  if (!product.virtualTryOnEnabled) {
    $w(TRY_BUTTON_ID).collapse();
    return;
  }

  $w(TRY_BUTTON_ID).expand();
  $w(TRY_BUTTON_ID).onClick(() => {
    const colour = getSelectedColour();
    const variant = product.vtoVariants.find((item) => item.colour === colour);
    if (!variant) {
      throw new Error(`No AURA Live asset is configured for ${colour}.`);
    }

    const payload = {
      productId: product._id,
      productName: product.name,
      garmentType: product.garmentType || 'full-body',
      colour,
      size: getSelectedSize(),
      garmentAsset: variant.garmentAsset,
    };

    const vto = $w(VTO_ELEMENT_ID);
    vto.setAttribute('product-json', JSON.stringify(payload));
    vto.setAttribute('open', 'true');
  });
}
