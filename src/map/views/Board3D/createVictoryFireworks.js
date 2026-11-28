import * as THREE from 'three'

// Visual RNG only; the launch centers are inside the coastal sand polygon.
export function sampleFirework(random = Math.random) {
    return {
        x: -7 + random() * 14,
        z: -13.8 + random(),
        y: 2.2 + random() * 1.4,
        radius: .55 + random() * .55,
        duration: .95 + random() * .5,
        interval: 1.1 + random() * 2.2,
        color: ['#d89936', '#ed9675', '#e4b64d', '#6cb8a5'][Math.floor(random() * 4)],
    }
}

export function createVictoryFireworks(scene, random = Math.random) {
    const count = 24
    const group = new THREE.Group()
    group.name = 'victory-fireworks'
    group.visible = false
    scene.add(group)
    const slots = Array.from({ length: 2 }, () => {
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(count * 6)
        const attribute = new THREE.BufferAttribute(positions, 3)
        attribute.setUsage(THREE.DynamicDrawUsage)
        geometry.setAttribute('position', attribute)
        const material = new THREE.LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
        const lines = new THREE.LineSegments(geometry, material)
        lines.frustumCulled = false
        lines.visible = false
        group.add(lines)
        return { geometry, positions, attribute, material, lines, start: -Infinity, spec: null,
            directions: new Float32Array(count * 3) }
    })
    let active = false, next = null, disposed = false
    function clear() {
        slots.forEach(slot => { slot.spec = null; slot.lines.visible = false })
        next = null
        group.visible = false
    }
    function update(elapsed, reduced = false) {
        if (disposed) return
        if (!active || reduced) { clear(); return }
        group.visible = true
        if (next === null) next = elapsed + .2
        if (elapsed >= next) {
            const slot = slots.find(s => !s.spec || elapsed - s.start >= s.spec.duration)
            if (slot) {
                const spec = sampleFirework(random)
                slot.spec = spec
                slot.start = elapsed
                slot.material.color.set(spec.color)
                slot.lines.position.set(spec.x, spec.y, spec.z)
                for (let i = 0; i < count; i++) {
                    const angle = i * Math.PI * 2 / count + random() * .18
                    const speed = .65 + random() * .35
                    slot.directions.set([Math.cos(angle) * speed, Math.sin(angle) * speed, (random() - .5) * .35], i * 3)
                }
                next = elapsed + spec.interval
            }
        }
        slots.forEach(slot => {
            if (!slot.spec) return
            const t = (elapsed - slot.start) / slot.spec.duration
            if (t >= 1) { slot.spec = null; slot.lines.visible = false; return }
            const distance = slot.spec.radius * (1 - Math.pow(1 - t, 2))
            const tail = Math.max(0, distance - .16 * (1 - t))
            const gravity = .27 * t * t
            for (let i = 0; i < count; i++) {
                const d = i * 3, p = i * 6
                const x = slot.directions[d], y = slot.directions[d + 1], z = slot.directions[d + 2]
                slot.positions[p] = x * tail
                slot.positions[p + 1] = y * tail - gravity
                slot.positions[p + 2] = z * tail
                slot.positions[p + 3] = x * distance
                slot.positions[p + 4] = y * distance - gravity
                slot.positions[p + 5] = z * distance
            }
            slot.attribute.needsUpdate = true
            slot.material.opacity = .8 * Math.sin(Math.PI * Math.min(1, t))
            slot.lines.visible = true
        })
    }
    return {
        group,
        setActive(value) {
            if (disposed || active === Boolean(value)) return
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
