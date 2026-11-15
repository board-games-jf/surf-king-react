import React, { useEffect, useRef, useState } from 'react'

// The heavy Three.js scene is imported only after the 3D view is selected.
export default function Board3D({ snapshot, onCellSelect, onUnavailable }) {
    const container = useRef(null)
    const scene = useRef(null)
    const latestClick = useRef(onCellSelect)
    const latestSnapshot = useRef(snapshot)
    const latestIds = useRef(false)
    const latestError = useRef(onUnavailable)
    const [error, setError] = useState(null)
    const [showIds, setShowIds] = useState(false)
    latestClick.current = onCellSelect
    latestSnapshot.current = snapshot
    latestIds.current = showIds
    latestError.current = onUnavailable

    useEffect(() => {
        let cancelled = false
        let instance = null
        import('./createScene').then(({ createScene }) => {
            if (cancelled || !container.current) return
            instance = createScene(
                container.current,
                (id) => latestClick.current(id),
                (message) => {
                    setError(message)
                    if (latestError.current) latestError.current(message)
                }
            )
            scene.current = instance
            instance.update(latestSnapshot.current)
            instance.toggleIds(latestIds.current)
        }).catch((cause) => {
            if (cancelled) return
            const message = 'The 3D board could not be loaded: ' + (cause?.message || 'Unknown error')
            setError(message)
            if (latestError.current) latestError.current(message)
        })
        return () => {
            cancelled = true
            if (instance) instance.dispose()
            if (scene.current === instance) scene.current = null
        }
        // Mount the GPU scene once; update game state separately.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (scene.current) scene.current.update(snapshot)
    }, [snapshot])

    useEffect(() => {
        if (scene.current) scene.current.toggleIds(showIds)
    }, [showIds])

    return (
        <div style={{ position: 'relative', width: '100%', height: 'min(72vh, 760px)', minHeight: 360, background: '#137b82' }}>
            <div ref={container} style={{ position: 'absolute', inset: 0 }} />
            <button
                type="button"
                onClick={() => scene.current?.resetCamera()}
                style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
            >
                Reset 3D camera
            </button>
            <label style={{ position: 'absolute', top: 12, left: 12, zIndex: 1, color: 'white', background: '#143e49bf', padding: 6 }}>
                <input type="checkbox" checked={showIds} onChange={(event) => setShowIds(event.target.checked)} /> Show cell IDs
            </label>
            {error && <div role="alert" style={{ position: 'absolute', bottom: 12, background: 'white' }}>{error}</div>}
            <div style={{ position: 'absolute', bottom: 12, left: 12, pointerEvents: 'none', color: 'white', background: '#103c46ba', padding: '6px 9px' }}>
                Drag to rotate/pan · Scroll to zoom · Click a hex to play
            </div>
        </div>
    )
}
