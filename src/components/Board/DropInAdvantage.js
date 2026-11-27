import React from 'react'
import { FeedbackIcon } from './r1FeedbackVisuals'
const labels = { favorable: 'Favorable', balanced: 'Balanced', unfavorable: 'Unfavorable' }
export default function DropInAdvantage({ odds }) {
    if (!odds) return null
    return <span className="r1-combat-advantage" data-advantage={odds.tone} style={{ '--combat-marker': (odds.position * 100) + '%' }}>
        <span className="r1-combat-caption"><FeedbackIcon kind={odds.tone}/>{labels[odds.tone]}</span>
        <span className="r1-combat-track" aria-hidden="true">
            {['unfavorable', 'balanced', 'favorable'].map(tone => <i key={tone} data-zone={tone}/>)}
            <b className="r1-combat-marker"/>
        </span>
    </span>
}
