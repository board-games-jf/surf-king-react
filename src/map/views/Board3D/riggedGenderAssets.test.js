import fs from 'fs'
import path from 'path'

function readGLB(name) {
  const data = fs.readFileSync(path.join(process.cwd(), 'public/assets/surfers', name))
  expect(data.subarray(0, 4).toString('ascii')).toBe('glTF')
  expect(data.readUInt32LE(4)).toBe(2)
  expect(data.readUInt32LE(8)).toBe(data.length)
  expect(data.subarray(16, 20).toString('ascii')).toBe('JSON')
  const length = data.readUInt32LE(12)
  return JSON.parse(data.subarray(20, 20 + length).toString('utf8'))
}

describe('two genuinely distinct Quaternius character bases', () => {
  test('female asset has its own face and skinned body, not a scaled male', () => {
    const male = readGLB('quaternius-male-base.glb')
    const female = readGLB('quaternius-female-base.glb')
    const femaleNames = female.nodes.map(node => node.name).filter(Boolean)
    const maleNames = male.nodes.map(node => node.name).filter(Boolean)
    expect(femaleNames).toContain('Superhero_Female')
    expect(maleNames).toContain('SuperHero_Male')
    expect(femaleNames).not.toContain('SuperHero_Male')
    expect(maleNames).not.toContain('Superhero_Female')
    expect(female.skins[0].joints).toHaveLength(65)
    expect(female.meshes).toHaveLength(3)
    const femaleBody = female.meshes.find(mesh => mesh.name === 'Superhero_Female')
    expect(femaleBody.primitives[0].attributes).toEqual(expect.objectContaining({
      POSITION: expect.any(Number), JOINTS_0: expect.any(Number),
      WEIGHTS_0: expect.any(Number)
    }))
    expect(female.buffers.every(buffer => !buffer.uri)).toBe(true)
    expect(female.images || []).toHaveLength(0)
  })

  test('bundled pack license covers both authored bodies', () => {
    const text = fs.readFileSync(
      path.join(process.cwd(), 'public/assets/surfers/QUATERNIUS-CC0-LICENSE.txt'), 'utf8'
    )
    expect(text).toMatch(/CC0 1\.0 Universal/)
    expect(text).toMatch(/Quaternius/)
  })
})
