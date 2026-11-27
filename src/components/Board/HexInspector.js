import React, { useEffect, useRef, useState } from 'react'
import { HexInspectionBody } from './R1Controls'
import DropInAdvantage from './DropInAdvantage'
import { FeedbackIcon } from './r1FeedbackVisuals'

export default function HexInspector({ info, options, blocks, placement, onConfirm, onClose }) {
    const [chosenKey, setChosenKey] = useState(null)
    const heading = useRef(null)
    const selected = options.find(option => option.key === chosenKey)
    const { side, anchorX, anchorY, ...style } = placement
    useEffect(() => { heading.current?.focus() }, [])
    return <>{side !== 'sheet' && <svg className="r1-hex-inspector-link" aria-hidden="true">
        <line x1={anchorX} y1={anchorY} x2={side === 'right' ? style.left : side === 'left' ? style.left + style.width : Math.max(style.left + 20, Math.min(style.left + style.width - 20, anchorX))} y2={side === 'below' ? style.top : style.top + 36}/>
        <circle cx={anchorX} cy={anchorY} r="3"/>
    </svg>}
    <section className="r1-board-action r1-hex-inspector" style={style} data-side={side}
        aria-label="Hex information" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onClose() } }}>
        <div ref={heading} tabIndex={-1} className="r1-hex-inspector-body">
            <HexInspectionBody hexFeedback={info} expanded/>
        </div>
        <button type="button" className="r1-board-action-close" aria-label="Close hex information" onClick={onClose}>×</button>
        <div className="r1-hex-inspector-options" role="group" aria-label="Available actions">
            <strong>{options.length ? 'Available actions' : 'No available actions'}</strong>
            {!options.length && <span className="r1-hex-inspector-reason">{info.action}</span>}
            {options.map(option => <button type="button" key={option.key} aria-pressed={selected?.key === option.key}
                className="r1-hex-option" data-risk={option.risky} data-advantage={option.odds?.tone} onClick={() => setChosenKey(option.key)}>
                <span className="r1-hex-option-icon"><FeedbackIcon kind={option.kind === 'drop' ? 'dropIn' : option.risky ? 'warning' : 'move'}/></span>
                <span className="r1-hex-option-text"><strong>{option.label}</strong><small>{option.detail}</small></span>
                {option.kind === 'drop' ? <DropInAdvantage odds={option.odds}/> :
                    <span className="r1-hex-option-cost">{option.cost !== 'Free' && option.cost !== 'Energy full' && <FeedbackIcon kind="energy"/>}{option.cost}</span>}
            </button>)}
            {blocks.map(block => <span className="r1-hex-inspector-reason" key={block.playerId}><FeedbackIcon kind="blocked"/>Player {block.playerId + 1} · {block.reason}</span>)}
        </div>
        {selected && <button type="button" className="r1-hex-confirm" onClick={() => onConfirm(selected.key)}>
            <FeedbackIcon kind={selected.kind === 'drop' ? 'dropIn' : 'move'}/>{selected.kind === 'drop' ? 'Choose dice' : 'Confirm move'}
        </button>}
    </section></>
}
