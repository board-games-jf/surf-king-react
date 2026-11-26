import { createCardPiles } from './createCardPiles'

test('the raft follows the water and stays still with reduced motion', () => {
  const context = { clearRect: jest.fn(), fillRect: jest.fn(), strokeRect: jest.fn(), setLineDash: jest.fn(), fillText: jest.fn(), save: jest.fn(), restore: jest.fn(), beginPath: jest.fn(), roundRect: jest.fn(), clip: jest.fn(), fill: jest.fn(), measureText: () => ({ width: 60 }) }
  const canvas = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
  const piles = createCardPiles()
  piles.update({ deck: 60, discard: 0, topDiscard: null })
  expect(piles.group.visible).toBe(true)
  expect(piles.group.position.x).toBeGreaterThan(0)
  piles.animate(1000, false, 1)
  const first = { y: piles.group.position.y, x: piles.group.rotation.x, z: piles.group.rotation.z }
  piles.animate(2500, false, 2.5)
  expect(piles.group.position.y).not.toBeCloseTo(first.y, 5)
  expect(piles.group.rotation.x).not.toBeCloseTo(first.x, 5)
  expect(piles.group.rotation.z).not.toBeCloseTo(first.z, 5)
  piles.animate(2500, true, 2.5)
  expect(piles.group.position.y).toBe(.12)
  expect(piles.group.rotation.x).toBe(0)
  expect(piles.group.rotation.z).toBe(0)
  piles.dispose()
  canvas.mockRestore()
})

test('a played discarded card flies face up before settling on the pile', () => {
  const context = { clearRect: jest.fn(), fillRect: jest.fn(), strokeRect: jest.fn(), setLineDash: jest.fn(), fillText: jest.fn(), save: jest.fn(), restore: jest.fn(), beginPath: jest.fn(), roundRect: jest.fn(), clip: jest.fn(), fill: jest.fn(), measureText: () => ({ width: 60 }) }
  const canvas = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
  const clock = jest.spyOn(performance, 'now').mockReturnValue(100)
  const piles = createCardPiles()
  piles.update({ deck: 40, discard: 0, topDiscard: null, event: null })
  piles.update({ deck: 40, discard: 1, topDiscard: 'Sunburn', event: { id: 1, name: 'Sunburn', origin: 0, discarded: true } })
  const card = piles.group.getObjectByName('discard-flight-card')
  piles.animate(550, false, 1)
  expect(card.visible).toBe(true)
  expect(card.rotation.x).toBeCloseTo(-Math.PI / 2)
  piles.animate(1100, false, 2)
  expect(card.visible).toBe(false)
  piles.dispose()
  clock.mockRestore()
  canvas.mockRestore()
})


test('pile thickness follows the card count and map number toggle hides pile labels', () => {
  const context = { clearRect: jest.fn(), fillRect: jest.fn(), strokeRect: jest.fn(), setLineDash: jest.fn(), fillText: jest.fn(), save: jest.fn(), restore: jest.fn(), beginPath: jest.fn(), roundRect: jest.fn(), clip: jest.fn(), fill: jest.fn(), measureText: () => ({ width: 60 }) }
  const canvas = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
  const piles = createCardPiles()
  piles.update({ deck: 58, discard: 5, topDiscard: 'Sunburn' })
  const deck = piles.group.getObjectByName('card-pile-deck-body')
  const high = deck.scale.y
  expect(context.roundRect).toHaveBeenCalledWith(8, 8, 240, 64, 24)
  piles.update({ deck: 30, discard: 5, topDiscard: 'Sunburn' })
  expect(deck.scale.y).toBeLessThan(high)
  const labels = []
  piles.group.traverse(node => { if (node.isSprite) labels.push(node) })
  expect(labels).toHaveLength(2)
  piles.toggleLabels(false)
  expect(labels.every(label => !label.visible)).toBe(true)
  piles.toggleLabels(true)
  expect(labels.every(label => label.visible)).toBe(true)
  piles.dispose()
  canvas.mockRestore()
})
