# Wix integration: Product and Category pages only

This integration adds AURA Live to the two existing Wix commerce page types. It does not recreate the home page, navigation, gallery, cart, or any unrelated site section.

## 1. Add the custom element once to each page type

Build and host `dist-element/aura-vto-element.js` over HTTPS. In Wix Studio, add a Custom Element to:

1. the Category/Shop page template;
2. the Product page template.

Use:

- tag name: `aura-virtual-try-on`
- element ID: `auraVirtualTryOn`
- source: the hosted `aura-vto-element.js` URL

The element itself uses `display: contents`; the full-screen interface appears only when `open="true"`.

## 2. Product data fields

Each eligible product needs the equivalent of:

```js
{
  virtualTryOnEnabled: true,
  garmentType: 'full-body',
  vtoVariants: [
    {
      colour: 'Stone',
      garmentAsset: 'https://cdn.example.com/vto/stone-open-collar-stone.png'
    },
    {
      colour: 'Charcoal',
      garmentAsset: 'https://cdn.example.com/vto/stone-open-collar-charcoal.png'
    }
  ]
}
```

These can live in existing product custom fields or in the data object your current page code already uses. AURA Live does not require a new database if equivalent fields already exist.

## 3. Category page placements

Inside the existing product repeater/card, add only:

- a small text label with ID `liveTryOnLabel`;
- a button with ID `tryItLiveButton`.

Place them where shown in the final supplied Category screenshot. Keep both collapsed by default. Paste the logic from `integrations/wix/category-page.js` into the existing Category page code, and change the repeater ID only if the current repeater uses a different ID.

The code collapses both controls when `virtualTryOnEnabled !== true` and passes the clicked card's product—not a hard-coded garment—to the custom element.

## 4. Product page placement

Add only the `TRY IT LIVE` button with ID `tryItLiveButton` beside the existing delivery action, matching the final supplied Product screenshot. Call `bindProductPageTryOn()` from `integrations/wix/product-page.js` after the existing page has resolved:

- the current product object;
- current colour;
- current size.

The selected colour is resolved against `vtoVariants` at click time, so changing to Charcoal loads the Charcoal garment asset.

## 5. Wix CLI app option

If this is distributed as a private Wix CLI app instead of a hosted custom element, log into Wix CLI and let the CLI generate the extension registration and UUID:

```bash
npx wix generate --params '{"extensionType":"CUSTOM_ELEMENT","name":"AURA Virtual Try-On","folder":"aura-virtual-try-on"}'
```

Do not hand-write the generated builder or extension UUID. Move the component logic into the generated widget files, keep the generated registration, and validate with:

```bash
npx tsc --noEmit
npx wix build
npx wix preview
```

## 6. Required browser conditions

- Camera access requires HTTPS or localhost.
- The browser asks for permission only after **START CAMERA**.
- MediaPipe model/WASM and garment asset hosts must permit browser CORS requests.
- Test camera-denied and no-camera states; the local photo fallback must remain available.
