// Only real viewport changes should update projection or reallocate the canvas.
// Keep camera position, orbit target and zoom untouched.
export function createBoardViewportResize(container, camera, renderer) {
    let lastWidth = 0
    let lastHeight = 0
    return function resize() {
        const width = Math.max(container.clientWidth, 1)
        const height = Math.max(container.clientHeight, 1)
        if (width === lastWidth && height === lastHeight) return
        lastWidth = width
        lastHeight = height
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
    }
}
