import React, { useEffect, useRef, useState } from 'react'
import { HexInspectionBody } from './R1Controls'
import { FeedbackIcon } from './r1FeedbackVisuals'

export default function HexInspector({ info, options, blocks, placement, onConfirm, onClose }) {
    const [chosenKey, setChosenKey] = useState(null)
    const heading = useRef(null)
    const selected = options.find(option => option.key === chosenKey)
    const { side, ...style } = placement
    useEffect(() => { heading.current?.focus() }, [])
    return <section className="r1-board-action r1-hex-inspector" style={style} data-side={side}
        aria-label="Hex information" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onClose() } }}>
        <div ref={heading} tabIndex={-1} className="r1-hex-inspector-body">
            <HexInspectionBody hexFeedback={info} expanded/>
        </div>
        <button type="button" className="r1-board-action-close" aria-label="Close hex information" onClick={onClose}>×</button>
        <div className="r1-hex-inspector-options" role="group" aria-label="Available actions">
            <strong>{options.length ? 'Available actions' : 'No available actions'}</strong>
            {!options.length && <span className="r1-hex-inspector-reason">{info.action}</span>}
            {options.map(option => <button type="button" key={option.key} aria-pressed={selected?.key === option.key}
                className="r1-hex-option" data-risk={option.risky} onClick={() => setChosenKey(option.key)}>
                <span className="r1-hex-option-icon"><FeedbackIcon kind={option.risky ? 'warning' : 'check'}/></span>
                <span className="r1-hex-option-text"><strong>{option.label}</strong><small>{option.detail}</small></span>
                <span className="r1-hex-option-cost"><FeedbackIcon kind="energy"/>{option.cost}</span>
            </button>)}
            {blocks.map(block => <span className="r1-hex-inspector-reason" key={block.playerId}><FeedbackIcon kind="blocked"/>Player {block.playerId + 1} · {block.reason}</span>)}
        </div>
        {selected && <button type="button" className="r1-hex-confirm" onClick={() => onConfirm(selected.key)}>
            <FeedbackIcon kind={selected.kind === 'drop' ? 'dropIn' : 'move'}/>{selected.kind === 'drop' ? 'Choose dice' : 'Confirm move'}
        </button>}
    </section>
}
