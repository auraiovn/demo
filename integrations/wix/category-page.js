// CATEGORY PAGE INTEGRATION
// EXISTING AURA CODE REMAINS UNCHANGED

const VTO_ELEMENT_ID = '#auraVirtualTryOn';
const PRODUCT_REPEATER_ID = '#productRepeater';
const LIVE_LABEL_ID = '#liveTryOnLabel';
const TRY_BUTTON_ID = '#tryItLiveButton';

function selectedVtoVariant(product) {
  const firstVariant = product.vtoVariants?.[0];
  if (!firstVariant) {
    return null;
  }

  return {
    productId: product._id,
    productName: product.name,
    garmentType: product.garmentType || 'full-body',
    colour: firstVariant.colour,
    garmentAsset: firstVariant.garmentAsset,
  };
}

$w.onReady(function () {
  $w(PRODUCT_REPEATER_ID).onItemReady(($item, product) => {
    const payload = product.virtualTryOnEnabled ? selectedVtoVariant(product) : null;

    if (!payload) {
      $item(LIVE_LABEL_ID).collapse();
      $item(TRY_BUTTON_ID).collapse();
      return;
    }

    $item(LIVE_LABEL_ID).expand();
    $item(TRY_BUTTON_ID).expand();
    $item(TRY_BUTTON_ID).onClick(() => {
      const vto = $w(VTO_ELEMENT_ID);
      vto.setAttribute('product-json', JSON.stringify(payload));
      vto.setAttribute('open', 'true');
    });
  });
});
