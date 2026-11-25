import React, { useEffect, useRef, useState } from 'react'

// The heavy Three.js scene is imported only after the 3D view is selected.
export default function Board3D({ snapshot, onCellSelect, onCellHover, onUnavailable, focusCellId = null, previewFemaleAthlete = true, athleteBoardType = null, sunburnPreview = null, bigWavePreview = null, amuletPreview = null, stonePreview = null, stormPreview = null, cyclonePreview = null, islandPreview = null, energyPreview = null, lifeguardPreview = null, jumpPreview = null, currentPreview = null, changePreview = null }) {
    const container = useRef(null)
    const scene = useRef(null)
    const latestClick = useRef(onCellSelect)
    const latestHover = useRef(onCellHover)
    const latestSnapshot = useRef(snapshot)
    const latestIds = useRef(true)
    const latestError = useRef(onUnavailable)
    const latestFocus = useRef(focusCellId)
    const [error, setError] = useState(null)
    const [showIds, setShowIds] = useState(true)
    latestClick.current = onCellSelect
    latestHover.current = onCellHover
    latestSnapshot.current = snapshot
    latestIds.current = showIds
    latestError.current = onUnavailable
    latestFocus.current = focusCellId

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
                },
                { previewFemaleAthlete, athleteBoardType, onCellHover: id => latestHover.current?.(id) }
            )
            scene.current = instance
            instance.update(latestSnapshot.current)
            instance.toggleIds(latestIds.current)
            if (Number.isInteger(latestFocus.current)) instance.focusCell(latestFocus.current)
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
    }, [previewFemaleAthlete, athleteBoardType])

    useEffect(() => {
        if (scene.current) scene.current.update(snapshot)
    }, [snapshot])

    useEffect(() => {
        if (sunburnPreview) scene.current?.playSunburn(sunburnPreview.playerId)
    }, [sunburnPreview])

    useEffect(() => {
        if (bigWavePreview) scene.current?.playBigWave(bigWavePreview.playerId, bigWavePreview.tsunami)
    }, [bigWavePreview])

    useEffect(() => {
        if (amuletPreview) scene.current?.playAmulet(amuletPreview.playerId)
    }, [amuletPreview])

    useEffect(() => {
        if (stonePreview) scene.current?.playStone(stonePreview.cellId)
    }, [stonePreview])

    useEffect(() => {
        if (stormPreview) scene.current?.playStorm(stormPreview.cellId)
    }, [stormPreview])

    useEffect(() => {
        if (cyclonePreview) scene.current?.playCyclone(cyclonePreview.cellId)
    }, [cyclonePreview])

    useEffect(() => {
        if (islandPreview) scene.current?.playIsland(islandPreview.cellId)
    }, [islandPreview])

    useEffect(() => {
        if (energyPreview) scene.current?.playEnergy(energyPreview.playerId)
    }, [energyPreview])

    useEffect(() => {
        if (lifeguardPreview) scene.current?.playLifeguard(lifeguardPreview.playerId)
    }, [lifeguardPreview])

    useEffect(() => {
        if (jumpPreview) scene.current?.playJump(jumpPreview.playerId)
    }, [jumpPreview])

    useEffect(() => {
        if (currentPreview) scene.current?.playSurfCurrent(currentPreview.playerId)
    }, [currentPreview])

    useEffect(() => {
        if (changePreview) scene.current?.playChange(changePreview.playerId, changePreview.targetId, changePreview.targetCell)
    }, [changePreview])

    useEffect(() => {
        if (scene.current) scene.current.toggleIds(showIds)
    }, [showIds])

    useEffect(() => {
        if (Number.isInteger(focusCellId)) scene.current?.focusCell(focusCellId)
    }, [focusCellId])

    return (
        <div className="surf-scene">
            <div ref={container} style={{ position: 'absolute', inset: 0 }} />
            <div className="surf-map-controls">
                <button type="button" onClick={() => scene.current?.resetCamera()}>Reset view</button>
                <button type="button" aria-label="Zoom in" onClick={() => scene.current?.zoom(1 / 1.25)}>+</button>
                <button type="button" aria-label="Zoom out" onClick={() => scene.current?.zoom(1.25)}>−</button>
                <button type="button" aria-pressed={showIds} onClick={() => setShowIds(!showIds)}>Numbers</button>
            </div>
            <div className="surf-map-controls surf-orbit-controls" role="group" aria-label="3D camera orientation">
                <button type="button" aria-label="Rotate left" title="Rotate left" onClick={() => scene.current?.orbit(-Math.PI / 8, 0)}>↶</button>
                <button type="button" aria-label="Rotate right" title="Rotate right" onClick={() => scene.current?.orbit(Math.PI / 8, 0)}>↷</button>
                <button type="button" aria-label="Tilt toward horizon" title="Tilt toward horizon" onClick={() => scene.current?.orbit(0, Math.PI / 12)}>↑</button>
                <button type="button" aria-label="Tilt toward overhead" title="Tilt toward overhead" onClick={() => scene.current?.orbit(0, -Math.PI / 12)}>↓</button>
            </div>
            {error && <div role="alert" style={{ position: 'absolute', bottom: 12, background: 'white' }}>{error}</div>}
        </div>
    )
}
