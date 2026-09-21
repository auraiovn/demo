import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const viteBin = fileURLToPath(
  new URL('../node_modules/vite/bin/vite.js', import.meta.url),
);
const preview = spawn(
  process.execPath,
  [viteBin, 'preview', '--host', '127.0.0.1', '--port', '4173'],
  { stdio: ['ignore', 'pipe', 'pipe'] },
);

let serverOutput = '';
preview.stdout.on('data', (chunk) => {
  serverOutput += String(chunk);
});
preview.stderr.on('data', (chunk) => {
  serverOutput += String(chunk);
});

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:4173/');
      if (response.ok) {
        return;
      }
    } catch {
      // The preview process is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Preview server did not start.\n${serverOutput}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

let browser;
let elementServer;

try {
  await waitForServer();
  const elementBundle = await readFile(
    new URL('../dist-element/aura-vto-element.js', import.meta.url),
  );
  elementServer = createServer((request, response) => {
    if (request.url === '/aura-vto-element.js') {
      response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
      response.end(elementBundle);
      return;
    }
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(
      '<!doctype html><html><head></head><body><script src="/aura-vto-element.js"></script></body></html>',
    );
  });
  await new Promise((resolve, reject) => {
    elementServer.once('error', reject);
    elementServer.listen(4174, '127.0.0.1', resolve);
  });
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    window.__auraGetUserMediaCalls = 0;
    window.__auraStoppedTracks = 0;
    window.__auraCameraMode = 'success';
    HTMLMediaElement.prototype.play = async () => undefined;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => {
          window.__auraGetUserMediaCalls += 1;
          if (window.__auraCameraMode === 'deny') {
            throw new DOMException('Denied by smoke test', 'NotAllowedError');
          }

          const stream = document.createElement('canvas').captureStream(1);
          stream.getTracks().forEach((track) => {
            const stop = track.stop.bind(track);
            track.stop = () => {
              window.__auraStoppedTracks += 1;
              stop();
            };
          });
          return stream;
        },
      },
    });
  });

  await page.goto('http://127.0.0.1:4173/category/all-products');
  assert((await page.locator('article').count()) === 8, 'All Products must show 8 cards.');

  const sandCard = page.locator('article').filter({ hasText: 'Sand Layering Blazer Set' });
  await sandCard.getByRole('button', { name: /Try Sand Layering Blazer Set live/i }).click();
  assert(
    (await page.getByRole('dialog').textContent())?.includes('Sand Layering Blazer Set'),
    'Category click did not open the clicked product.',
  );
  assert(
    (await page.evaluate(() => window.__auraGetUserMediaCalls)) === 0,
    'Camera started before explicit consent.',
  );
  await page.keyboard.press('Escape');

  await page.goto('http://127.0.0.1:4173/product/stone-open-collar-set');
  await page.getByRole('button', { name: 'Charcoal' }).click();
  await page.getByRole('button', { name: 'TRY IT LIVE' }).click();
  const dialogText = await page.getByRole('dialog').textContent();
  assert(dialogText?.includes('Charcoal'), 'Selected colour was not passed into AURA Live.');
  await page.getByRole('button', { name: 'START CAMERA' }).click();
  await page.waitForTimeout(100);
  assert(
    (await page.evaluate(() => window.__auraGetUserMediaCalls)) === 1,
    'Camera was not requested exactly once after START CAMERA.',
  );
  await page.keyboard.press('Escape');
  assert((await page.getByRole('dialog').count()) === 0, 'ESC did not close AURA Live.');
  assert(
    (await page.evaluate(() => window.__auraStoppedTracks)) > 0,
    'Closing AURA Live did not stop all camera tracks.',
  );

  await page.evaluate(() => {
    window.__auraCameraMode = 'deny';
  });
  await page.getByRole('button', { name: 'TRY IT LIVE' }).click();
  await page.getByRole('button', { name: 'START CAMERA' }).click();
  await page.waitForTimeout(100);
  assert(
    (await page.getByRole('alert').textContent())?.includes('Camera access is off'),
    'Camera-denied guidance was not shown.',
  );
  assert(
    await page.getByRole('button', { name: 'UPLOAD PHOTO FALLBACK' }).isVisible(),
    'Photo fallback disappeared after camera denial.',
  );
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/category/clothing');
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  assert(!hasOverflow, 'Mobile category page has horizontal overflow.');

  const elementPage = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  elementPage.on('pageerror', (error) => {
    console.error('Custom element page error:', error);
  });
  await elementPage.goto('http://127.0.0.1:4174/');
  await Promise.race([
    elementPage.evaluate(() => customElements.whenDefined('aura-virtual-try-on')),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Custom element registration timed out.')), 5000),
    ),
  ]);
  await elementPage.evaluate(() => {
    const element = document.createElement('aura-virtual-try-on');
    element.setAttribute(
      'product-json',
      JSON.stringify({
        productId: 'element-test',
        productName: 'Wix Element Test',
        garmentType: 'full-body',
        colour: 'Stone',
        size: 'M',
        garmentAsset:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/55n8WQAAAABJRU5ErkJggg==',
      }),
    );
    element.setAttribute('open', 'true');
    document.body.append(element);
  });
  assert(
    (await elementPage.getByRole('dialog').textContent())?.includes('Wix Element Test'),
    'The Wix custom-element bundle did not open with its product payload.',
  );
  assert(
    (await elementPage.locator('#aura-vto-element-styles').count()) === 1,
    'The Wix custom-element bundle did not inject its scoped CSS.',
  );
  await elementPage.getByRole('button', { name: 'Close AURA Live' }).click();
  await elementPage.close();

  console.log('AURA e2e smoke test passed.');
} finally {
  await browser?.close();
  if (elementServer) {
    await new Promise((resolve) => elementServer.close(resolve));
  }
  if (preview.exitCode === null) {
    preview.kill('SIGTERM');
    await Promise.race([
      once(preview, 'exit'),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
  }
}
