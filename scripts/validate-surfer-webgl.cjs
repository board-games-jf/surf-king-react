// Capture real WebGL pixels for human review; not automatic visual acceptance.
const fs = require('fs')
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE)
const candidate = process.env.SURFER_CANDIDATE_GLB
const output = candidate ? 'artifacts/male-review' : 'artifacts/surfer-review'
fs.mkdirSync(output, { recursive: true })
async function capture(page, canvas, name) {
  await page.waitForTimeout(800)
  await canvas.screenshot({ path: output + '/' + name + '.png', timeout: 60000 })
}
async function verifyBoardMotion(page, board, id, label) {
  const state = value => page.waitForFunction(({ id, value }) => {
    const canvas = document.querySelector('canvas[data-athlete-male-ready="true"][data-athlete-female-ready="true"]')
    return canvas?.getAttribute('data-surfer-motion' + id) === value
  }, { id, value })
  await page.getByRole('button', { name: 'Focus on the selected ' + label + ' surfer' }).click()
  await state('riding')
  await page.getByRole('button', { name: 'Glide to nearby hex' }).click()
  await state('moving')
  await state('riding')
  await capture(page, board, 'catalog-' + label + '-after-glide')
  await page.getByRole('button', { name: 'Fall off board' }).click()
  await state('falling')
  await state('fallen')
  await capture(page, board, 'catalog-' + label + '-fallen')
  await page.getByRole('button', { name: 'Get back on board' }).click()
  await state('remounting')
  await state('riding')
  await capture(page, board, 'catalog-' + label + '-remounted')
}
async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    page.setDefaultTimeout(60000)
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('http://127.0.0.1:4173/#/customize')
    await page.locator('canvas[data-athlete-character="female"]').waitFor({state:'visible'})
    if (candidate) {
      await page.getByRole('button', {name: 'Masculino'}).click()
      await page.locator('canvas[data-athlete-character="male"]').waitFor({state:'visible'})
    }
    const canvas = page.locator('.art-review-canvas canvas')
    const surf = page.getByRole('button', { name: /^(Surf|A surfar)$/ }).first()
    await page.waitForFunction(() => Array.from(document.querySelectorAll('button')).some(button => /^(Surf|A surfar)$/.test(button.textContent.trim()) && !button.disabled))
    assert.equal(await surf.getAttribute('aria-pressed'), 'true')
    await capture(page, canvas, 'desktop-surf')
    const standing = page.getByRole('button', { name: /^(Base|Em pé)$/ }).first()
    await standing.click()
    assert.equal(await standing.getAttribute('aria-pressed'), 'true')
    await capture(page, canvas, 'desktop-standing')
    const relaxed = page.getByRole('button', { name: /^(Relaxed|Relaxado|Relaxada)$/ }).first()
    await relaxed.click()
    assert.equal(await relaxed.getAttribute('aria-pressed'), 'true')
    await capture(page, canvas, 'desktop-relaxed')
    await page.waitForTimeout(200)
    await capture(page, canvas, 'desktop-relaxed-wave')
    await surf.click()
    assert.equal(await surf.getAttribute('aria-pressed'), 'true')
    const box = await canvas.boundingBox()
    for (const [index, drag] of [.15,.25,.3].entries()) {
      const x = box.x + box.width*.5, y = box.y + box.height*.5
      await page.mouse.move(x,y)
      await page.mouse.down()
      await page.mouse.move(x+box.height*drag,y,{steps:12})
      await page.mouse.up()
      await capture(page,canvas,'desktop-orbit-'+(index+1))
    }
    if (candidate) {
      assert.equal(await page.getByRole('button', {name: 'Guardar visual'}).isDisabled(), false)
      await page.getByRole('button', {name: 'Guardar visual'}).click()
      await page.reload()
      await page.locator('canvas[data-athlete-character="male"]').waitFor({state:'visible'})
      await page.getByRole('link', {name: 'Ver no tabuleiro'}).click()
      const board = page.locator('canvas[data-athlete-male-ready="true"][data-athlete-female-ready="true"]')
      await board.waitFor({state:'visible'})
      await page.getByRole('button', {name: 'Focus on the selected male surfer'}).click()
      await page.waitForTimeout(1200)
      await capture(page, board, 'catalog-selected-male')
      await verifyBoardMotion(page, board, 0, 'male')
      await page.getByRole('link', {name: 'Customize surfer'}).click()
      await page.locator('canvas[data-athlete-character="male"]').waitFor({state:'visible'})
      await page.getByRole('button', {name: 'Feminina'}).click()
      await page.locator('canvas[data-athlete-character="female"]').waitFor({state:'visible'})
      await capture(page, canvas, 'female-restored')
      assert.deepEqual(errors,[])
      console.log('Approved male selection, save/reload, real catalog placement and female restoration exercised.')
      return
    }
    await page.setViewportSize({width:390,height:844})
    await capture(page,canvas,'mobile-surf')
    await page.setViewportSize({width:1440,height:1000})
    await page.getByRole('link', {name: 'Ver no tabuleiro'}).click()
    const board=page.locator('canvas[data-athlete-male-ready="true"][data-athlete-female-ready="true"]')
    await board.waitFor({state:'visible'})
    await page.getByRole('button',{name:'Focus on the selected female surfer'}).click()
    await page.waitForTimeout(1200)
    await capture(page,board,'catalog-selected-female')
    await verifyBoardMotion(page, board, 1, 'female')
    assert.deepEqual(errors,[])
    console.log('Actual WebGL athlete viewer and catalog loaded; orbit and pose switching exercised.')
  } finally { await browser.close() }
}
main().catch(error=>{console.error(error);process.exitCode=1})
