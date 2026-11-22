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
      await page.getByLabel('Carregar candidato masculino GLB').setInputFiles(candidate)
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
      assert.equal(await page.getByRole('button', {name: 'Guardar visual'}).isDisabled(), true)
      await page.getByRole('button', {name: 'Feminina'}).click()
      await page.locator('canvas[data-athlete-character="female"]').waitFor({state:'visible'})
      await capture(page, canvas, 'female-restored')
      assert.deepEqual(errors,[])
      console.log('Male candidate loaded with the shared anatomical pose solver; screenshots need visual approval.')
      return
    }
    await page.setViewportSize({width:390,height:844})
    await capture(page,canvas,'mobile-surf')
    await page.setViewportSize({width:1440,height:1000})
    await page.goto('http://127.0.0.1:4173/#/catalog')
    const board=page.locator('canvas[data-athlete-ready="true"]')
    await board.waitFor({state:'visible'})
    await page.getByRole('button',{name:'Focus on the selected female surfer'}).click()
    await page.waitForTimeout(1200)
    await capture(page,board,'catalog-selected-female')
    assert.deepEqual(errors,[])
    console.log('Actual WebGL athlete viewer and catalog loaded; orbit and pose switching exercised.')
  } finally { await browser.close() }
}
main().catch(error=>{console.error(error);process.exitCode=1})
