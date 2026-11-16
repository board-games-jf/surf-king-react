import * as THREE from 'three'
import { createPremiumSurfboardProof, getPremiumBoardShape } from './premiumSurfboardProof'

function disposeProof(group) {
  group.traverse(node => {
    if (node.geometry) node.geometry.dispose()
    if (node.material) node.material.dispose()
  })
}

describe('isolated sculpted surfboard quality proof (#33)', () => {
  test.each(['shortboard', 'fish', 'longboard'])(
    '%s has a smooth longitudinal hull, actual deck stripe and fin', type => {
      const proof = createPremiumSurfboardProof(type, '#33b9c4')
      const hull = proof.getObjectByName('premium-board-hull')
      const stripe = proof.getObjectByName('premium-deck-stripe')
      const fin = proof.getObjectByName('premium-board-fin')
      expect(hull.isMesh).toBe(true)
      expect(stripe.isMesh).toBe(true)
      expect(fin.isMesh).toBe(true)
      expect(hull.geometry.type).toBe('BufferGeometry')
      expect(hull.geometry.getAttribute('position').count).toBeGreaterThan(2000)
      expect(hull.material.color.equals(new THREE.Color('#33b9c4'))).toBe(true)
      expect(hull.material.clearcoat).toBeGreaterThan(0)

      const bounds = new THREE.Box3().setFromObject(proof)
      const dimensions = bounds.getSize(new THREE.Vector3())
      expect(dimensions.x).toBeGreaterThan(1.5)
      expect(dimensions.z).toBeGreaterThan(.35)
      expect(dimensions.y).toBeGreaterThan(.2)
      expect(getPremiumBoardShape(type).length).toBeGreaterThan(1.5)
      fin.geometry.computeBoundingBox()
      expect(fin.geometry.boundingBox.min.y).toBeLessThan(0)

      const stripeNormals = stripe.geometry.getAttribute('normal')
      expect(stripeNormals.getY(88)).toBeGreaterThan(0)
      const positions = hull.geometry.getAttribute('position')
      for (let i = 0; i < positions.count; i++) {
        expect(Number.isFinite(positions.getX(i))).toBe(true)
        expect(Number.isFinite(positions.getY(i))).toBe(true)
        expect(Number.isFinite(positions.getZ(i))).toBe(true)
      }
      disposeProof(proof)
    }
  )

  test('shape records are independent and unsupported board types use shortboard safely', () => {
    const shape = getPremiumBoardShape('fish')
    shape.length = 99
    expect(getPremiumBoardShape('fish').length).not.toBe(99)
    const fallback = createPremiumSurfboardProof('unknown')
    const bounds = new THREE.Box3().setFromObject(fallback)
    expect(bounds.max.x - bounds.min.x).toBeLessThan(2)
    disposeProof(fallback)
  })
})
