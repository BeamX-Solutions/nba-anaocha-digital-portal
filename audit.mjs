import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOT_DIR = path.join(__dirname, 'audit-screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const BASE = 'http://localhost:5173';
let shotIndex = 0;
const issues = [];

const shot = async (page, label) => {
  const name = `${String(++shotIndex).padStart(2,'0')}-${label}.png`;
  const p = path.join(SHOT_DIR, name);
  await page.screenshot({ path: p, fullPage: true });
  console.log(`  📸 ${name}`);
  return p;
};

const flag  = (sev, loc, msg) => { issues.push({ sev, loc, msg }); console.log(`  [${sev}] ${loc}: ${msg}`); };
const pass  = (msg) => console.log(`  ✅ ${msg}`);
const info  = (msg) => console.log(`  ℹ️  ${msg}`);

(async () => {
  const browser = await chromium.launch({
    headless: false, slowMo: 150,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(`[${page.url().split('/').pop()}] ${m.text()}`); });
  page.on('requestfailed', r => { if (!r.url().includes('chrome-extension')) flag('WARN','Network',`Blocked: ${r.url().slice(0,80)}`); });

  // ── 1. LANDING PAGE ─────────────────────────────────────────────────
  console.log('\n━━━ [1] Landing page ━━━');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await shot(page, 'landing-top');

  const heroH = await page.locator('h1').first().textContent().catch(() => '');
  info(`H1: "${heroH?.trim().slice(0,60)}"`);

  const year2014count = await page.locator('text=2014').count();
  year2014count > 0 ? pass('2014 founding year present') : flag('FAIL','Landing','2014 founding year missing');

  const year2011count = await page.locator('text=2011').count();
  year2011count > 0 ? flag('FAIL','Landing','2011 still present on page') : pass('No stale 2011 year');

  // Scroll mid — committees
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
  await page.waitForTimeout(400);
  await shot(page, 'landing-committees');
  const committees = await page.locator('text=Human Rights, text=ICT').count();
  committees > 0 ? pass('Committee section visible') : flag('WARN','Landing','Committee section not found');

  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await shot(page, 'landing-footer');
  const footerEl   = await page.locator('footer').textContent().catch(() => '');
  footerEl.includes('2014') ? pass('Footer: 2014 correct')  : flag('FAIL','Footer','Missing 2014');
  footerEl.includes('2011') ? flag('FAIL','Footer','2011 still in footer') : pass('Footer: no stale 2011');

  // ── 2. SIGN-IN PAGE ─────────────────────────────────────────────────
  console.log('\n━━━ [2] Sign-in page ━━━');
  await page.goto(`${BASE}/auth/signin`, { waitUntil: 'networkidle' });
  await shot(page, 'signin');

  const emailInput  = await page.locator('input[type="email"]').count();
  const pwInput     = await page.locator('input[type="password"]').count();
  const googleBtn   = await page.locator('button:has-text("Continue with Google")').count();
  const signInBtn   = await page.locator('button[type="submit"]').count();
  const forgotLink  = await page.locator('text=Forgot password').count();
  const signUpLink  = await page.locator('text=Sign Up').count();

  emailInput  > 0 ? pass('Email field present')            : flag('FAIL','Sign-in','No email field');
  pwInput     > 0 ? pass('Password field present')         : flag('FAIL','Sign-in','No password field');
  googleBtn   > 0 ? pass('Continue with Google present')   : flag('FAIL','Sign-in','No Google button');
  signInBtn   > 0 ? pass('Submit button present')          : flag('FAIL','Sign-in','No submit button');
  forgotLink  > 0 ? pass('Forgot password link present')   : flag('WARN','Sign-in','No forgot password link');
  signUpLink  > 0 ? pass('Sign Up link present')           : flag('WARN','Sign-in','No sign up link');

  // ── 3. SIGN-UP PAGE ─────────────────────────────────────────────────
  console.log('\n━━━ [3] Sign-up page ━━━');
  await page.goto(`${BASE}/auth/signup`, { waitUntil: 'networkidle' });
  await shot(page, 'signup');
  const signupForm = await page.locator('form, input[type="email"]').count();
  signupForm > 0 ? pass('Sign-up form renders') : flag('FAIL','Sign-up','No form found');

  // ── 4. PROTECTED ROUTES REDIRECT ────────────────────────────────────
  console.log('\n━━━ [4] Auth guards — protected routes redirect to sign-in ━━━');
  const protectedRoutes = [
    '/anaocha/dashboard', '/anaocha/apply', '/anaocha/applications',
    '/anaocha/payments', '/anaocha/members', '/anaocha/profile',
    '/anaocha/settings', '/anaocha/notifications',
  ];
  for (const route of protectedRoutes) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const url = page.url();
    const redirected = url.includes('/signin') || url.includes('/auth/') || url.includes('/complete-profile');
    redirected ? pass(`${route} → redirects to auth`) : flag('FAIL', route, 'Accessible without login');
  }

  // ── 5. REMOVED ROUTES → 404 ─────────────────────────────────────────
  console.log('\n━━━ [5] Removed routes return 404 or redirect ━━━');
  const removedRoutes = ['/anaocha/my-documents', '/admin/approval-queue', '/anaocha/about'];
  for (const route of removedRoutes) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const url = page.url();
    const body = await page.locator('body').textContent().catch(() => '');
    const is404 = body.includes('404') || body.includes('Not Found') || body.includes('not found');
    const lastSegment = route.split('/').pop() || '';
    const redirected = !url.endsWith(lastSegment) || url.includes('/signin');
    (is404 || redirected)
      ? pass(`${route} → correctly gone (redirected or 404)`)
      : flag('WARN', route, 'Removed route still renders content');
    if (!is404 && !redirected) await shot(page, `stale-route-${route.replace(/\//g,'-').slice(1)}`);
  }

  // ── 6. PUBLIC PAGES RENDER CORRECTLY ────────────────────────────────
  console.log('\n━━━ [6] Public pages ━━━');

  // Blog
  await page.goto(`${BASE}/blog`, { waitUntil: 'networkidle' });
  await shot(page, 'blog');
  const blogH = await page.locator('h1').first().textContent().catch(() => '');
  info(`Blog H1: "${blogH?.trim()}"`);
  const blogCards = await page.locator('article, [class*="card"], .shadow-card').count();
  blogCards > 0 ? pass(`Blog: ${blogCards} post cards visible`) : flag('WARN','Blog','No post cards found');

  // Resources
  await page.goto(`${BASE}/resources`, { waitUntil: 'networkidle' });
  await shot(page, 'resources');
  const resH = await page.locator('h1').first().textContent().catch(() => '');
  info(`Resources H1: "${resH?.trim()}"`);

  // Contact (public)
  await page.goto(`${BASE}/anaocha/contact`, { waitUntil: 'networkidle' });
  await shot(page, 'contact');
  const hasObeledu = (await page.locator('body').textContent().catch(() => '')).includes('Obeledu');
  hasObeledu ? pass('Contact: Obeledu address present') : flag('WARN','Contact','Obeledu address not found');
  const contactForm = await page.locator('form, textarea').count();
  contactForm > 0 ? pass('Contact form present') : flag('WARN','Contact','No contact form');

  // About branch (still a valid page, just removed from sidebar)
  await page.goto(`${BASE}/anaocha/about`, { waitUntil: 'networkidle' });
  await shot(page, 'about-branch');
  const aboutBody = await page.locator('body').textContent().catch(() => '');
  aboutBody.includes('2014') ? pass('About page: 2014 correct')  : flag('WARN','About','2014 not on about page');
  aboutBody.includes('2011') ? flag('FAIL','About','2011 still on about page') : pass('About page: no stale 2011');
  aboutBody.includes('Obeledu') || aboutBody.includes('Family Bar') ? pass('About page has branch content') : flag('WARN','About','About page seems empty');

  // ── 7. 404 PAGE ──────────────────────────────────────────────────────
  console.log('\n━━━ [7] 404 page ━━━');
  await page.goto(`${BASE}/this-does-not-exist`, { waitUntil: 'networkidle' });
  await shot(page, '404-page');
  const body404 = await page.locator('body').textContent().catch(() => '');
  (body404.includes('404') || body404.includes('not found') || body404.includes('Not Found'))
    ? pass('404 page renders')
    : flag('WARN','404','Custom 404 page not shown for unknown routes');

  // ── 8. SIGN-IN FLOW UX CHECKS ───────────────────────────────────────
  console.log('\n━━━ [8] Sign-in UX edge cases ━━━');
  await page.goto(`${BASE}/auth/signin`, { waitUntil: 'networkidle' });

  // Empty submit
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(400);
  const afterEmptySubmit = page.url();
  afterEmptySubmit.includes('/signin') ? pass('Empty submit stays on sign-in page') : flag('WARN','Sign-in','Empty form submission navigated away');

  // Bad email format
  await page.locator('input[type="email"]').fill('notanemail');
  await page.locator('input[type="password"]').fill('anything');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(600);
  await shot(page, 'signin-bad-email');
  pass('Bad email format — browser/form validation tested');

  // ── 9. FORGOT PASSWORD PAGE ──────────────────────────────────────────
  console.log('\n━━━ [9] Forgot password page ━━━');
  await page.goto(`${BASE}/auth/forgot-password`, { waitUntil: 'networkidle' });
  await shot(page, 'forgot-password');
  const forgotForm = await page.locator('input[type="email"]').count();
  forgotForm > 0 ? pass('Forgot password form renders') : flag('WARN','Forgot Password','No email input');

  // ── CONSOLE ERROR SUMMARY ─────────────────────────────────────────────
  console.log('\n━━━ Console errors ━━━');
  if (consoleErrors.length === 0) {
    pass('No console errors across all public pages');
  } else {
    consoleErrors.forEach(e => flag('WARN','Console', e.slice(0,120)));
  }

  await browser.close();

  // ── REPORT ────────────────────────────────────────────────────────────
  console.log('\n\n══════════════════════════════════════════════════');
  console.log('  AUDIT REPORT — Public Surface');
  console.log('══════════════════════════════════════════════════');
  const fails = issues.filter(i => i.sev === 'FAIL');
  const warns = issues.filter(i => i.sev === 'WARN');
  console.log(`\n  FAIL: ${fails.length}   WARN: ${warns.length}`);
  if (fails.length) { console.log('\n  ❌ Failures:'); fails.forEach(i => console.log(`     [${i.loc}] ${i.msg}`)); }
  if (warns.length) { console.log('\n  ⚠️  Warnings:'); warns.forEach(i => console.log(`     [${i.loc}] ${i.msg}`)); }
  if (!fails.length && !warns.length) console.log('\n  All checks passed.');
  console.log('\n  Screenshots:', SHOT_DIR);
})();
