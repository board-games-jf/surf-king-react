import * as THREE from 'three'

// Visual RNG only. Start above the front of the sand, near the winner.
export function sampleFirework(random = Math.random, anchorX = 0) {
    const x = Math.max(-8, Math.min(8, anchorX + (random() < .5 ? -1 : 1) * (1 + random() * 2.2)))
    const shore = -9.85 - x * x * .014 + Math.sin(x * .5) * .12
    return {
        x,
        z: shore - .65 - random() * .65,
        y: 1.8 + random() * .65,
        radius: .85 + random() * .4,
        duration: 1.55 + random() * .4,
        interval: 1.0 + random() * .85,
        color: ['#ffce65', '#ff987d', '#ffe3a2', '#9ce6ce'][Math.min(3, Math.floor(random() * 4))],
    }
}

export function chooseFirework(random, anchorX, score) {
    let best = null, bestScore = Infinity
    for (let i = 0; i < 8; i++) {
        const candidate = sampleFirework(random, anchorX)
        const value = score(candidate)
        if (!best || value < bestScore) { best = candidate; bestScore = value }
        if (value <= 1) break
    }
    return best
}

// Two triangles form a tapered, camera-facing trail of actual world-space width.
export function writeRay(array, offset, dx, dy, tail, tip, gravity, width, z) {
    const length = Math.hypot(dx, dy) || 1
    const nx = -dy / length * width, ny = dx / length * width
    const ax = dx * tail, ay = dy * tail - gravity
    const bx = dx * tip, by = dy * tip - gravity
    const p = offset
    array[p] = ax + nx; array[p+1] = ay + ny; array[p+2] = z
    array[p+3] = ax - nx; array[p+4] = ay - ny; array[p+5] = z
    array[p+6] = bx - nx * .4; array[p+7] = by - ny * .4; array[p+8] = z
    array[p+9] = ax + nx; array[p+10] = ay + ny; array[p+11] = z
    array[p+12] = bx - nx * .4; array[p+13] = by - ny * .4; array[p+14] = z
    array[p+15] = bx + nx * .4; array[p+16] = by + ny * .4; array[p+17] = z
}

export function createVictoryFireworks(scene, random = Math.random) {
    const count = 24
    const group = new THREE.Group()
    group.name = 'victory-fireworks'
    group.visible = false
    scene.add(group)
    const outline = new THREE.Color('#83472b')
    const projected = new THREE.Vector3()
    const slots = Array.from({ length: 2 }, () => {
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(count * 36)
        const colors = new Float32Array(count * 36)
        const attribute = new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
        const colorAttribute = new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage)
        geometry.setAttribute('position', attribute)
        geometry.setAttribute('color', colorAttribute)
        const material = new THREE.MeshBasicMaterial({
            vertexColors: true, transparent: true, opacity: 0, depthWrite: false,
            toneMapped: false, side: THREE.DoubleSide,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.frustumCulled = false
        mesh.visible = false
        group.add(mesh)
        return { geometry, positions, attribute, colors, colorAttribute, material, mesh,
            start: -Infinity, spec: null, directions: new Float32Array(count * 2) }
    })
    let active = false, next = null, disposed = false, anchorX = 0
    function clear() {
        slots.forEach(slot => { slot.spec = null; slot.mesh.visible = false })
        next = null
        group.visible = false
    }
    function update(elapsed, reduced = false, camera = null) {
        if (disposed) return
        if (!active || reduced) { if (group.visible || next !== null) clear(); return }
        group.visible = true
        if (next === null) next = elapsed
        if (elapsed >= next) {
            const slot = slots.find(s => !s.spec || elapsed - s.start >= s.spec.duration)
            if (slot) {
                const spec = chooseFirework(random, anchorX, candidate => {
                    if (!camera) return 0
                    projected.set(candidate.x, candidate.y, candidate.z).project(camera)
                    if (projected.z < -1 || projected.z > 1) return Infinity
                    return Math.max(Math.abs(projected.x) / .80, Math.abs(projected.y) / .76)
                })
                slot.spec = spec
                slot.start = elapsed
                slot.mesh.position.set(spec.x, spec.y, spec.z)
                const color = new THREE.Color(spec.color)
                for (let i = 0; i < count; i++) {
                    const angle = i * Math.PI * 2 / count + random() * .18
                    const speed = .65 + random() * .35
                    slot.directions[i * 2] = Math.cos(angle) * speed
                    slot.directions[i * 2 + 1] = Math.sin(angle) * speed
                    for (let v = 0; v < 12; v++) (v < 6 ? outline : color).toArray(slot.colors, i * 36 + v * 3)
                }
                slot.colorAttribute.needsUpdate = true
                next = elapsed + spec.interval
            }
        }
        slots.forEach(slot => {
            if (!slot.spec) return
            const t = (elapsed - slot.start) / slot.spec.duration
            if (t >= 1) { slot.spec = null; slot.mesh.visible = false; return }
            if (camera) slot.mesh.quaternion.copy(camera.quaternion)
            const distance = slot.spec.radius * (1 - Math.pow(1 - t, 2))
            const tail = Math.max(0, distance - .28 * (1 - t) - .06)
            const gravity = .18 * t * t
            for (let i = 0; i < count; i++) {
                const dx = slot.directions[i * 2], dy = slot.directions[i * 2 + 1]
                const width = .047 * (1 - .35 * t)
                writeRay(slot.positions, i * 36, dx, dy, tail, distance, gravity, width, 0)
                writeRay(slot.positions, i * 36 + 18, dx, dy, tail, distance, gravity, width * .52, .006)
            }
            slot.attribute.needsUpdate = true
            slot.material.opacity = .9 * Math.min(1, t / .12, (1 - t) / .30)
            slot.mesh.visible = true
        })
    }
    return {
        group,
        setActive(value, winnerX = 0) {
            if (disposed) return
            if (Number.isFinite(winnerX)) anchorX = winnerX
            if (active === Boolean(value)) return
            active = Boolean(value)
            if (!active) clear()
        },
        update,
        dispose() {
            if (disposed) return
            disposed = true
            clear()
            scene.remove(group)
            slots.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose() })
        },
    }
}
