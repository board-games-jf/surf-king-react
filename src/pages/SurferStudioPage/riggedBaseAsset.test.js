import fs from 'fs'
import path from 'path'

const asset = path.join(process.cwd(), 'public/assets/surfers/quaternius-male-base.glb')
const license = path.join(process.cwd(), 'public/assets/surfers/QUATERNIUS-CC0-LICENSE.txt')

describe('licensed GLB character base fixture', () => {
  test('is a self-contained glTF 2.0 binary with actual skinned geometry', () => {
    const data = fs.readFileSync(asset)
    expect(data.subarray(0, 4).toString('ascii')).toBe('glTF')
    expect(data.readUInt32LE(4)).toBe(2)
    expect(data.readUInt32LE(8)).toBe(data.length)
    expect(data.subarray(16, 20).toString('ascii')).toBe('JSON')

    const jsonLength = data.readUInt32LE(12)
    const gltf = JSON.parse(data.subarray(20, 20 + jsonLength).toString('utf8'))
    expect(gltf.asset.version).toBe('2.0')
    expect(gltf.skins.some(skin => skin.joints.length >= 50)).toBe(true)
    expect(gltf.nodes.some(node => /^head$/i.test(node.name || ''))).toBe(true)
    expect(gltf.meshes.length).toBeGreaterThan(0)
    expect(gltf.meshes.some(mesh => mesh.primitives.some(p => p.attributes.JOINTS_0 !== undefined))).toBe(true)
    expect(gltf.buffers.every(buffer => !buffer.uri)).toBe(true)
    expect(gltf.images || []).toHaveLength(0)
  })

  test("includes the original author's CC0 license and source", () => {
    const text = fs.readFileSync(license, 'utf8')
    expect(text).toMatch(/CC0 1\.0 Universal/)
    expect(text).toMatch(/Quaternius/)
  })
})
