// Headless smoke test: walk all pages, log in, and report console/page errors.
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const errors = []

const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`)
})
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))

async function check(name, fn) {
  try {
    await fn()
    console.log(`PASS  ${name}`)
  } catch (e) {
    console.log(`FAIL  ${name}: ${e.message.split('\n')[0]}`)
  }
}

// 1. Login page renders
await check('login page renders', async () => {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.waitForSelector('form', { timeout: 5000 })
  const title = await page.textContent('h2')
  if (!title.includes('Sign in')) throw new Error(`unexpected h2: ${title}`)
})

// 2. Login validation error appears
await check('login validation error', async () => {
  await page.click('button[type="submit"]')
  await page.waitForSelector('text=Email is required.', { timeout: 3000 })
})

// 3. Register page renders
await check('register page renders', async () => {
  await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Create your account', { timeout: 5000 })
})

// 4. Protected route redirects to login when signed out
await check('protected redirect when signed out', async () => {
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
  const url = page.url()
  if (!url.includes('/login')) throw new Error(`not redirected, still: ${url}`)
})

// 5. Login with demo credentials
await check('login with demo creds', async () => {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.fill('#email', 'demo@pulsegrid.io')
  await page.fill('#password', 'demo1234')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 8000 })
})

// 6. Dashboard renders KPI cards and charts
await check('dashboard KPI cards + chart', async () => {
  await page.waitForSelector('text=Total devices', { timeout: 5000 })
  await page.waitForSelector('text=Online', { timeout: 5000 })
  await page.waitForSelector('svg.recharts-surface', { timeout: 8000 })
})

// 7. Devices page: search filters grid
await check('devices page + search filter', async () => {
  await page.goto(`${BASE}/devices`, { waitUntil: 'networkidle' })
  await page.waitForSelector('#device-search', { timeout: 5000 })
  const before = await page.locator('.grid a, .grid > *').count()
  await page.fill('#device-search', 'zzz-no-match-123')
  await page.waitForSelector('text=No devices match your filters', { timeout: 4000 })
  await page.fill('#device-search', '')
  const after = await page.locator('h3').count()
  if (after < 4) throw new Error(`expected ≥4 device cards after clearing search, got ${after} (before: ${before})`)
})

// 8. Device detail renders telemetry + charts
await check('device detail page', async () => {
  await page.goto(`${BASE}/devices`, { waitUntil: 'networkidle' })
  await page.locator('a:has-text("Details")').first().click()
  await page.waitForSelector('text=Temperature', { timeout: 5000 })
  await page.waitForSelector('text=Device attributes', { timeout: 5000 })
  await page.waitForSelector('text=Status history', { timeout: 5000 })
  await page.waitForSelector('svg.recharts-surface', { timeout: 8000 })
})

// 9. Device detail 404 state
await check('device detail not-found state', async () => {
  await page.goto(`${BASE}/devices/DEV-9999`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Device not found', { timeout: 5000 })
})

// 10. Add device modal opens + creates device + toast
await check('add device modal + toast', async () => {
  await page.goto(`${BASE}/devices`, { waitUntil: 'networkidle' })
  await page.waitForSelector('#device-search', { timeout: 5000 })
  await page.getByRole('button', { name: 'Add device' }).first().click()
  await page.waitForSelector('#device-name', { timeout: 5000 })
  await page.fill('#device-name', 'Smoke Test Node')
  await page.locator('[role="dialog"] button[type="submit"]').click()
  await page.waitForSelector('text=Smoke Test Node added successfully!', { timeout: 5000 })
})

// 11. Global ⌘K search dropdown (every ID contains "DEV-1")
await check('global search dropdown', async () => {
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
  await page.fill('#global-search', 'DEV-1')
  await page.waitForSelector('header ul li', { timeout: 4000 })
})

// 12. Logout via account menu
await check('logout via account menu', async () => {
  await page.click('[aria-label="Account menu"]')
  await page.click('text=Sign out')
  await page.waitForURL('**/login', { timeout: 5000 })
})

await browser.close()

console.log('\n---')
if (errors.length) {
  console.log(`CONSOLE/PAGE ERRORS (${errors.length}):`)
  errors.forEach((e) => console.log('  ' + e))
  process.exit(1)
} else {
  console.log('No console errors or page errors detected.')
}
