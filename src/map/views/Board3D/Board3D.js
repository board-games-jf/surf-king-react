import React, { useEffect, useRef, useState } from 'react'

// The heavy Three.js scene is imported only after the 3D view is selected.
export default function Board3D({ snapshot, onCellSelect, onUnavailable }) {
    const container = useRef(null)
    const scene = useRef(null)
    const latestClick = useRef(onCellSelect)
    const latestSnapshot = useRef(snapshot)
    const latestIds = useRef(true)
    const latestError = useRef(onUnavailable)
    const [error, setError] = useState(null)
    const [showIds, setShowIds] = useState(true)
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
        <div className="surf-scene">
            <div ref={container} style={{ position: 'absolute', inset: 0 }} />
            <div className="surf-map-controls">
                <button type="button" onClick={() => scene.current?.resetCamera()}>Reset view</button>
                <button type="button" aria-label="Zoom in" onClick={() => scene.current?.zoom(1 / 1.25)}>+</button>
                <button type="button" aria-label="Zoom out" onClick={() => scene.current?.zoom(1.25)}>−</button>
                <button type="button" aria-pressed={showIds} onClick={() => setShowIds(!showIds)}>Numbers</button>
            </div>
            {error && <div role="alert" style={{ position: 'absolute', bottom: 12, background: 'white' }}>{error}</div>}
        </div>
    )
}
