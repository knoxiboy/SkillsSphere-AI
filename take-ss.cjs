const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CONFIG = {
  baseUrl: 'http://localhost:5174/mock-interview',
  screenshotDir: './screenshots',
  timeouts: {
    pageLoad: 2000,
    sessionStart: 3000,
    elementWait: 5000,
  },
  selectors: {
    startButton: ['text=Start', 'text=Begin', 'button[data-testid="start"]', '[aria-label="Start Interview"]'],
    sentimentIndicator: ['[data-testid="sentiment"]', '.sentiment-indicator', '[aria-label="Sentiment"]'],
  },
};

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function tryClick(page, selectors, timeout = 5000) {
  for (const sel of selectors) {
    try {
      await page.click(sel, { timeout });
      return sel;
    } catch {
      continue;
    }
  }
  return null;
}

async function waitForAny(page, selectors, timeout = 5000) {
  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout });
      return sel;
    } catch {
      continue;
    }
  }
  return null;
}

async function captureScreenshot(page, filename, label) {
  const filePath = path.join(CONFIG.screenshotDir, filename);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[screenshot] ${label} → ${filePath}`);
  return filePath;
}

(async () => {
  await ensureDir(CONFIG.screenshotDir);
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();

    // --- Lobby ---
    console.log('[nav] loading lobby...');
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(CONFIG.timeouts.pageLoad);
    await captureScreenshot(page, 'lobby.png', 'lobby loaded');

    // --- Start session ---
    const clickedSel = await tryClick(page, CONFIG.selectors.startButton, CONFIG.timeouts.elementWait);
    if (clickedSel) {
      console.log(`[action] clicked start via: ${clickedSel}`);
      await page.waitForTimeout(CONFIG.timeouts.sessionStart);
      await captureScreenshot(page, 'session.png', 'session started');

      // --- Sentiment indicator ---
      const sentimentSel = await waitForAny(page, CONFIG.selectors.sentimentIndicator);
      if (sentimentSel) {
        console.log(`[found] sentiment indicator: ${sentimentSel}`);
        await captureScreenshot(page, 'sentiment.png', 'sentiment visible');
      } else {
        console.warn('[warn] sentiment indicator not found — check selectors in CONFIG');
      }
    } else {
      console.warn('[warn] no start button matched — check CONFIG.selectors.startButton');
    }

  } catch (err) {
    console.error('[error]', err.message);
    process.exit(1);
  } finally {
    await browser.close();
    console.log('[done] browser closed');
  }
})();