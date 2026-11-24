import { createBoardViewportResize } from './resizeBoardViewport'

test('resizes only on actual viewport changes and preserves the camera pose and zoom', () => {
    const container = { clientWidth: 900, clientHeight: 500 }
    const position = { x: 8, y: 26, z: 34 }
    const camera = { position, zoom: 1.4, aspect: 1, updateProjectionMatrix: jest.fn() }
    const renderer = { setSize: jest.fn() }
    const resize = createBoardViewportResize(container, camera, renderer)
    resize()
    resize()
    expect(camera.aspect).toBe(1.8)
    expect(camera.updateProjectionMatrix).toHaveBeenCalledTimes(1)
    expect(renderer.setSize).toHaveBeenCalledTimes(1)
    expect(renderer.setSize).toHaveBeenLastCalledWith(900, 500, false)
    container.clientHeight = 400
    resize()
    resize()
    expect(camera.aspect).toBe(2.25)
    expect(camera.updateProjectionMatrix).toHaveBeenCalledTimes(2)
    expect(renderer.setSize).toHaveBeenLastCalledWith(900, 400, false)
    expect(camera.position).toBe(position)
    expect(camera.zoom).toBe(1.4)
})
test('avoids a zero-sized canvas while the viewport is hidden', () => {
    const container = { clientWidth: 0, clientHeight: 0 }
    const camera = { updateProjectionMatrix: jest.fn() }
    const renderer = { setSize: jest.fn() }
    const resize = createBoardViewportResize(container, camera, renderer)
    resize()
    resize()
    expect(renderer.setSize).toHaveBeenCalledTimes(1)
    expect(renderer.setSize).toHaveBeenLastCalledWith(1, 1, false)
    expect(camera.aspect).toBe(1)
})
