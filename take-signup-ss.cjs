const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CONFIG = {
  baseUrl: 'http://localhost:5174/register',
  screenshotDir: './screenshots',
  videoDir: './feature-videos',
  video: { width: 1280, height: 720 },
  timeouts: {
    pageLoad: 2000,
    elementWait: 5000,
  },
  selectors: {
    form: ['form', '[data-testid="register-form"]', '#register-form'],
    submitButton: ['button[type="submit"]', 'text=Register', 'text=Sign Up', 'text=Create Account'],
    emailField: ['input[type="email"]', 'input[name="email"]', '[data-testid="email"]'],
    passwordField: ['input[type="password"]', 'input[name="password"]', '[data-testid="password"]'],
    nameField: ['input[name="name"]', 'input[name="fullName"]', '[data-testid="name"]', 'input[placeholder*="name" i]'],
    confirmPasswordField: ['input[name="confirmPassword"]', 'input[name="passwordConfirm"]', '[data-testid="confirm-password"]', 'input[placeholder*="confirm" i]'],
    successMessage: ['[data-testid="success"]', '[class*="success"]', '[role="status"]', 'text=Account created', 'text=Registration successful'],
    errorMessage: ['[class*="error"]', '[class*="alert"]', '[role="alert"]', '[data-testid="error"]'],
  },
  testData: {
    name: 'Test User',
    email: `testuser${Date.now()}@example.com`,
    password: 'Test@1234',
  },
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function attachNetworkLogger(page) {
  page.on('requestfailed', req => {
    console.warn(`[network] failed: ${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
  });
  page.on('response', res => {
    if (res.status() >= 400) {
      console.warn(`[network] ${res.status()} ${res.url()}`);
    }
  });
}

function attachConsoleLogger(page) {
  page.on('console', msg => {
    if (msg.type() === 'error') console.warn(`[console.error] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.warn(`[page.error] ${err.message}`);
  });
}

async function tryClick(page, selectors, timeout = 5000) {
  for (const sel of selectors) {
    try {
      await page.click(sel, { timeout });
      console.log(`[click] matched: ${sel}`);
      return sel;
    } catch { continue; }
  }
  return null;
}

async function waitForAny(page, selectors, timeout = 5000) {
  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout });
      return sel;
    } catch { continue; }
  }
  return null;
}

async function waitForNavigation(page, expectedPath, timeout = 5000) {
  try {
    await page.waitForURL(`**${expectedPath}**`, { timeout });
    console.log(`[nav] reached: ${expectedPath}`);
    return true;
  } catch {
    console.warn(`[warn] expected ${expectedPath} — current: ${page.url()}`);
    return false;
  }
}

async function captureScreenshot(page, filename, label) {
  const filePath = path.join(CONFIG.screenshotDir, filename);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[screenshot] ${label} → ${filePath}`);
  return filePath;
}

async function fillField(page, selectors, value, label) {
  const sel = await waitForAny(page, selectors, CONFIG.timeouts.elementWait);
  if (sel) {
    await page.fill(sel, value);
    console.log(`[fill] ${label} via: ${sel}`);
    return sel;
  }
  console.warn(`[warn] ${label} field not found`);
  return null;
}

async function extractFormValidationState(page) {
  return page.$$eval('input', els => els.map(e => ({
    name: e.name,
    type: e.type,
    valid: e.validity?.valid,
    validationMessage: e.validationMessage,
    value: e.type === 'password' ? '[hidden]' : e.value,
  })));
}

(async () => {
  ensureDir(CONFIG.screenshotDir);
  ensureDir(CONFIG.videoDir);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    recordVideo: { dir: CONFIG.videoDir, size: CONFIG.video },
  });

  try {
    const page = await context.newPage();
    attachNetworkLogger(page);
    attachConsoleLogger(page);

    console.log('[nav] loading register page...');
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(CONFIG.timeouts.pageLoad);
    await captureScreenshot(page, '01-signup-lobby.png', 'register page loaded');

    // --- Detect form ---
    const formSel = await waitForAny(page, CONFIG.selectors.form, CONFIG.timeouts.elementWait);
    if (formSel) {
      console.log(`[found] form: ${formSel}`);
    } else {
      console.warn('[warn] no form detected — check CONFIG.selectors.form');
    }

    // --- Fill name (optional field) ---
    await fillField(page, CONFIG.selectors.nameField, CONFIG.testData.name, 'name');

    // --- Fill email ---
    await fillField(page, CONFIG.selectors.emailField, CONFIG.testData.email, 'email');

    // --- Fill password ---
    await fillField(page, CONFIG.selectors.passwordField, CONFIG.testData.password, 'password');

    // --- Fill confirm password (optional field) ---
    await fillField(page, CONFIG.selectors.confirmPasswordField, CONFIG.testData.password, 'confirmPassword');

    await captureScreenshot(page, '02-signup-filled.png', 'form filled');

    // --- Capture form validation state before submit ---
    const validationState = await extractFormValidationState(page);
    console.log('[debug] form validation state:', JSON.stringify(validationState, null, 2));

    // --- Submit ---
    const submitSel = await tryClick(page, CONFIG.selectors.submitButton, CONFIG.timeouts.elementWait);
    if (submitSel) {
      await page.waitForTimeout(CONFIG.timeouts.pageLoad);
      await captureScreenshot(page, '03-signup-submitted.png', 'form submitted');

      // --- Check for success message before nav ---
      const successSel = await waitForAny(page, CONFIG.selectors.successMessage, 2000);
      if (successSel) {
        const successText = await page.$eval(successSel, el => el.innerText ?? el.textContent);
        console.log(`[success] message: ${successText}`);
        await captureScreenshot(page, '04-signup-success-msg.png', 'success message');
      }

      const navigated = await waitForNavigation(page, '/dashboard', 3000);
      if (!navigated) {
        // --- Extract error messages ---
        const errorSel = await waitForAny(page, CONFIG.selectors.errorMessage, 2000);
        if (errorSel) {
          const errors = await page.$$eval(
            '[class*="error"],[class*="alert"],[role="alert"],[data-testid="error"]',
            els => els.map(e => e.innerText.trim()).filter(Boolean)
          );
          console.warn('[warn] form errors:', errors);
        }
        await captureScreenshot(page, '04-signup-error.png', 'signup error state');
      } else {
        await captureScreenshot(page, '04-signup-success.png', 'signup success — dashboard');
      }
    } else {
      console.warn('[warn] submit button not found — check CONFIG.selectors.submitButton');
      await captureScreenshot(page, '03-submit-missing.png', 'submit button not found');
    }

    // --- Debug ---
    const buttons = await page.$$eval('button', els => els.map(e => e.innerText.trim()));
    console.log('[debug] buttons:', buttons);
    const testIds = await page.$$eval('[data-testid]', els => els.map(e => e.dataset.testid));
    console.log('[debug] testids:', testIds);
    const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, id: e.id })));
    console.log('[debug] inputs:', inputs);
    const ariaLabels = await page.$$eval('[aria-label]', els => els.map(e => e.getAttribute('aria-label')));
    console.log('[debug] aria-labels:', ariaLabels);

  } catch (err) {
    console.error('[error]', err.message);
    process.exit(1);
  } finally {
    await context.close();
    await browser.close();
    console.log('[done] video saved to', CONFIG.videoDir);
  }
})();