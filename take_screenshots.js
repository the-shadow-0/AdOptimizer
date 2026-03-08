const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  if (!fs.existsSync('docs/assets')) {
    fs.mkdirSync('docs/assets', { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const routes = [
    { path: '/', name: 'dashboard' },
    { path: '/campaigns', name: 'campaigns' },
    { path: '/experiments', name: 'experiments' },
    { path: '/audiences', name: 'audiences' },
    { path: '/creatives', name: 'creatives' },
    { path: '/settings', name: 'settings' }
  ];

  for (const route of routes) {
    console.log(`Capturing ${route.name}...`);
    await page.goto(`http://localhost:3000${route.path}`, { waitUntil: 'networkidle' });
    // Let the animations run and data fetch
    await page.waitForTimeout(2000); 
    await page.screenshot({ path: `docs/assets/${route.name}.png` });
    console.log(`Saved docs/assets/${route.name}.png`);
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
})();
