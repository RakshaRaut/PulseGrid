import { chromium } from 'playwright'

const BASE = 'http://localhost:5199'
const out = (n) => `shots/${n}.png`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

// Log in
await page.goto(`${BASE}/login`)
await page.waitForTimeout(600)
await page.locator('input[type="email"]').first().fill('qa@test.dev')
await page.locator('input[type="password"]').first().fill('test1234')
await page.locator('button[type="submit"]').first().click()
await page.waitForTimeout(1800)
await page.screenshot({ path: out('dashboard'), fullPage: true })

// Devices list
await page.goto(`${BASE}/devices`)
await page.waitForTimeout(800)
await page.screenshot({ path: out('devices'), fullPage: true })

// Device detail (click first device link if present)
const link = page.locator('a[href^="/devices/DEV-"]').first()
if (await link.count()) {
  await link.click()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: out('device-detail'), fullPage: true })
} else {
  console.log('no device link found')
  await page.screenshot({ path: out('device-detail-empty'), fullPage: true })
}

// Mobile dashboard
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mobile.goto(`${BASE}/login`)
await mobile.waitForTimeout(600)
await mobile.locator('input[type="email"]').first().fill('qa@test.dev')
await mobile.locator('input[type="password"]').first().fill('test1234')
await mobile.locator('button[type="submit"]').first().click()
await mobile.waitForTimeout(1800)
await mobile.screenshot({ path: out('dashboard-mobile'), fullPage: true })

console.log('pageerrors:', errors.length ? errors : 'none')
await browser.close()
