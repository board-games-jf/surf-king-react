// Browser-level layout smoke test. Screenshots are for human visual review.
const fs = require('node:fs')
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE)
const output = 'artifacts/r1-hud-review'
fs.mkdirSync(output, { recursive: true })

async function startMatch(browser, viewport, players) {
    const page = await browser.newPage({ viewport })
    page.setDefaultTimeout(60000)
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto('http://127.0.0.1:4173/#/local')
    await page.getByRole('button', { name: String(players), exact: true }).click()
    await page.locator('.r1-floating-hud').waitFor({ state: 'visible' })
    assert.equal(await page.locator('.r1-player-badge').count(), players)
    return { page, errors }
}

async function verifyStableViewport(page, name) {
    const map = page.locator('.surf-match-r1 .surf-map')
    const before = await map.boundingBox()
    assert.ok(before.width > 0 && before.height > 0)
    assert.ok(Math.abs(before.height - page.viewportSize().height) <= 2, 'Map must fill viewport')
    await page.getByRole('button', { name: 'Hide cards', exact: true }).click()
    assert.deepEqual(await map.boundingBox(), before)
    assert.equal(await page.locator('.r1-hand').count(), 0)
    await page.getByRole('button', { name: 'Show cards', exact: true }).click()
    assert.deepEqual(await map.boundingBox(), before)
    const firstCard = page.locator('.r1-hand button').first()
    await firstCard.hover()
    const detail = page.locator('.r1-card-detail')
    await detail.waitFor({ state: 'visible' })
    assert.ok(await detail.locator('.r1-card-availability').count())
    assert.ok(await detail.locator('.r1-inspection-art').count())
    assert.ok(await detail.evaluate(el => el.scrollHeight <= el.clientHeight + 1), 'Card feedback must not need vertical scrolling')
    assert.equal(await firstCard.getAttribute('aria-pressed'), 'false')
    assert.deepEqual(await map.boundingBox(), before)
    await page.screenshot({ path: output + '/' + name + '-card-feedback.png', timeout: 60000 })
    await page.mouse.move(1, 1)
    if (await page.locator('.surf-map-2d').count()) {
        const hex = page.locator('.surf-map-2d [data-cell-id="28"]')
        // Dispatch exact SVG events rather than assume a pixel is unobscured.
        await hex.dispatchEvent('mouseover')
        const info = page.getByLabel('Hex information')
        await info.waitFor({ state: 'visible' })
        assert.ok((await info.textContent()).includes('Shark'))
        assert.ok((await info.textContent()).includes('2 energy'))
        assert.deepEqual(await map.boundingBox(), before)
        await hex.dispatchEvent('mouseout')
        await info.waitFor({ state: 'detached' })
        await hex.dispatchEvent('click')
        await hex.dispatchEvent('mouseout')
        await info.waitFor({ state: 'visible' })
        assert.ok((await info.textContent()).includes('Shark'))
        await page.screenshot({ path: output + '/' + name + '-hex-feedback.png', timeout: 60000 })
        await page.getByRole('button', { name: 'Close hex information' }).click()
        await info.waitFor({ state: 'detached' })
    }
    const bounds = await page.locator('.r1-action-bar').boundingBox()
    assert.ok(bounds.x >= -1 && bounds.y >= -1)
    assert.ok(bounds.x + bounds.width <= page.viewportSize().width + 1)
    assert.ok(bounds.y + bounds.height <= page.viewportSize().height + 1)
    await page.screenshot({ path: output + '/' + name + '.png', timeout: 60000 })
    await page.getByRole('button', { name: 'Move', exact: true }).click()
    assert.deepEqual(await map.boundingBox(), before)
    const targets = page.getByLabel('Legal target hexes')
    await targets.waitFor({ state: 'visible' })
    await targets.getByRole('button').first().click()
    assert.deepEqual(await map.boundingBox(), before)
}

async function main() {
    const browser = await chromium.launch({ channel: 'chrome', headless: true,
        args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
    try {
        const desktop = await startMatch(browser, { width: 1440, height: 900 }, 2)
        await verifyStableViewport(desktop.page, 'desktop-2d')
        await desktop.page.getByRole('button', { name: '3D', exact: true }).click()
        const canvas = desktop.page.locator('canvas[aria-label="Interactive Surf King 3D board"]')
        await canvas.waitFor({ state: 'visible' })
        await canvas.evaluate(el => { el.dataset.hudValidation = 'same-canvas' })
        const before = await canvas.boundingBox()
        await verifyStableViewport(desktop.page, 'desktop-3d')
        assert.deepEqual(await canvas.boundingBox(), before)
        assert.equal(await canvas.getAttribute('data-hud-validation'), 'same-canvas')
        assert.deepEqual(desktop.errors, [])
        await desktop.page.close()

        const mobile = await startMatch(browser, { width: 390, height: 844 }, 7)
        await verifyStableViewport(mobile.page, 'mobile-2d-seven-players')
        const order = mobile.page.getByLabel('Round play order')
        assert.ok(await order.evaluate(el => el.scrollWidth > el.clientWidth), 'Seven players must scroll horizontally')
        await order.evaluate(el => { el.scrollLeft = el.scrollWidth })
        assert.ok(await order.evaluate(el => el.scrollLeft > 0))
        assert.deepEqual(mobile.errors, [])
        await mobile.page.close()
        console.log('Floating HUD: desktop/mobile map sizes, hand toggles, movement and 3D canvas identity verified.')
    } finally {
        await browser.close()
    }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
