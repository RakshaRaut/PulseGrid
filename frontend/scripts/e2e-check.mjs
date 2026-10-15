import { chromium } from 'playwright'

const BASE = 'http://localhost:5199'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

// Login (fresh storage so there is no stale session from the earlier curl-created account)
await page.goto(`${BASE}/login`)
await page.waitForTimeout(600)
await page.locator('input[type="email"]').first().fill('qa@test.dev')
await page.locator('input[type="password"]').first().fill('test1234')
await page.locator('button[type="submit"]').first().click()
await page.waitForTimeout(1800)

// Devices page — should now show the curl-created device
await page.goto(`${BASE}/devices`)
await page.waitForTimeout(1000)
const deviceCount = await page.locator('a[href^="/devices/"]').count()
console.log('device links on /devices:', deviceCount)
await page.screenshot({ path: 'shots/devices-with-data.png', fullPage: true })

// Open device detail
if (deviceCount > 0) {
  await page.locator('a[href^="/devices/"]').first().click()
  await page.waitForTimeout(1400)
  await page.screenshot({ path: 'shots/device-detail.png', fullPage: true })
  console.log('detail url:', page.url())
}

// Dashboard with data
await page.goto(`${BASE}/dashboard`)
await page.waitForTimeout(1200)
await page.screenshot({ path: 'shots/dashboard-with-data.png', fullPage: true })

// Add-device modal via UI
await page.goto(`${BASE}/devices`)
await page.waitForTimeout(800)
await page.getByRole('button', { name: 'Add device' }).first().click()
await page.waitForTimeout(400)
await page.locator('#device-name').fill('Rooftop Weather Node')
await page.locator('#device-location').selectOption('Rooftop')
await page.getByRole('button', { name: /^Add device$/ }).last().click()
await page.waitForTimeout(1500)
const countAfter = await page.locator('a[href^="/devices/"]').count()
console.log('device links after adding:', countAfter)
await page.screenshot({ path: 'shots/devices-after-add.png', fullPage: true })

console.log('pageerrors:', errors.length ? errors : 'none')
await browser.close()
