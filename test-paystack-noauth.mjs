import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOT_DIR = path.join(__dirname, 'paystack-screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const shot = async (page, name) => {
  const p = path.join(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  console.log(`SCREENSHOT: ${p}`);
};

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  const networkBlocked = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('requestfailed', req => networkBlocked.push(`BLOCKED: ${req.url()} — ${req.failure()?.errorText}`));

  // ── Step 1: Load the app home page ──────────────────────────────────
  console.log('\n[1] Loading app…');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await shot(page, '01-home');
  console.log('   Title:', await page.title());
  console.log('   URL:', page.url());

  // ── Step 2: Inject Paystack script and try to open a payment popup ───
  console.log('\n[2] Loading Paystack inline script…');
  const scriptLoaded = await page.evaluate(() => new Promise((resolve) => {
    if (window.PaystackPop) return resolve('already-loaded');
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.onload = () => resolve('loaded');
    s.onerror = () => resolve('failed');
    document.head.appendChild(s);
  }));
  console.log('   Paystack script status:', scriptLoaded);

  // ── Step 3: Verify PaystackPop is available ──────────────────────────
  const popAvailable = await page.evaluate(() => typeof window.PaystackPop !== 'undefined');
  console.log('   window.PaystackPop available:', popAvailable);

  // ── Step 4: Open a real Paystack test popup ──────────────────────────
  console.log('\n[3] Opening Paystack payment popup (test key, test amount ₦100)…');
  const popupOpenResult = await page.evaluate(() => {
    return new Promise((resolve) => {
      try {
        const handler = window.PaystackPop.setup({
          key:      'pk_test_ca0ebfefa4368b68dfe31c2c7473245656e0c089',
          email:    'ibehchimaobi98@gmail.com',
          amount:   10000, // ₦100 in kobo
          currency: 'NGN',
          ref:      `TEST-${Date.now()}`,
          callback: (res) => resolve({ event: 'callback', reference: res.reference }),
          onClose:  ()    => resolve({ event: 'closed' }),
        });
        handler.openIframe();
        resolve({ event: 'opened' });
      } catch (err) {
        resolve({ event: 'error', message: String(err) });
      }
    });
  });
  console.log('   openIframe() result:', JSON.stringify(popupOpenResult));

  // Wait for Paystack iframe/modal to appear
  await page.waitForTimeout(3000);
  await shot(page, '02-paystack-popup');

  // ── Step 5: Check for Paystack iframe in DOM ─────────────────────────
  const iframeSrcs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('iframe')).map(f => f.src || f.getAttribute('src') || '(no-src)')
  );
  console.log('\n[4] Iframes in DOM:', iframeSrcs);

  const paystackIframe = iframeSrcs.filter(s => s.includes('paystack') || s.includes('js.paystack'));
  console.log('   Paystack iframes:', paystackIframe.length > 0 ? paystackIframe : 'NONE FOUND');

  // ── Step 6: Check all frames visible ────────────────────────────────
  const frames = page.frames();
  console.log('\n[5] Page frames:', frames.map(f => f.url()).filter(u => u.length > 10));

  await shot(page, '03-dom-state');

  // ── Step 7: Console errors summary ──────────────────────────────────
  console.log('\n[6] Console errors:', consoleErrors.length > 0 ? consoleErrors : 'none');
  console.log('[7] Blocked requests:', networkBlocked.length > 0 ? networkBlocked : 'none');

  await page.waitForTimeout(5000);
  await browser.close();
  console.log('\nDone. Screenshots in:', SHOT_DIR);
})();
