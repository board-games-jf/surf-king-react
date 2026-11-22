// Prepare the exact owner-approved male GLB before starting the app or building.
// No runtime network request; optionally pass a previously downloaded local GLB.
const fs = require('node:fs/promises')
const path = require('node:path')
const crypto = require('node:crypto')
const target = path.resolve(__dirname, '../public/assets/surfers/man-base-character-rigged.glb')
const source = 'https://grab3d.com/dl/man-base-character-rigged/man-base-character-rigged.glb'
const expectedBytes = 11354468
const expectedHash = '3038f56e1225d0ef9692189ed19ff688f1424e669281148a4cc6995fed568496'
function valid(data) {
  return data.length === expectedBytes && crypto.createHash('sha256').update(data).digest('hex') === expectedHash
}
async function main() {
  try {
    if (valid(await fs.readFile(target))) return
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  let data
  if (process.argv[2]) {
    const file = process.argv[2]
    if ((await fs.stat(file)).size !== expectedBytes) throw new Error('Unexpected local model size.')
    data = await fs.readFile(file)
  } else {
    const response = await fetch(source, { signal: AbortSignal.timeout(60000) })
    if (!response.ok || !response.body || !response.url.startsWith('https://')) throw new Error('Model download failed: ' + response.status)
    const reader = response.body.getReader()
    let length = 0
    const chunks = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > expectedBytes) { await reader.cancel(); throw new Error('Unexpected downloaded model size.') }
      chunks.push(Buffer.from(value))
    }
    data = Buffer.concat(chunks)
  }
  if (!valid(data)) throw new Error('Male GLB does not match the owner-approved SHA-256.')
  await fs.mkdir(path.dirname(target), { recursive: true })
  const temp = target + '.' + process.pid + '.tmp'
  try {
    await fs.writeFile(temp, data)
    await fs.rename(temp, target)
  } finally { await fs.rm(temp, { force: true }) }
  console.log('Prepared verified male surfer asset.')
}
main().catch(error => {
  console.error(error.message + ' Run npm run prepare:surfer-assets -- /path/to/man-base-character-rigged.glb to use the verified local file.')
  process.exitCode = 1
})
