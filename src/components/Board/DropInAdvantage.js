import React from 'react'
import { FeedbackIcon } from './r1FeedbackVisuals'
const labels = { favorable: 'Favorable', balanced: 'Balanced', unfavorable: 'Unfavorable' }
export default function DropInAdvantage({ odds, compact = false }) {
    if (!odds) return null
    const explanation = labels[odds.tone] + ': chance to knock down the opponent before reaching 1 energy, assuming repeated attacks with maximum dice after this roll.'
    return <span className="r1-combat-advantage" data-advantage={odds.tone} style={{ '--combat-marker': (odds.position * 100) + '%' }} title={explanation} aria-label={explanation} role={compact ? 'img' : undefined}>
        {!compact && <span className="r1-combat-caption"><FeedbackIcon kind={odds.tone}/>{labels[odds.tone]}</span>}
        <span className="r1-combat-track" aria-hidden="true">
            {['unfavorable', 'balanced', 'favorable'].map(tone => <i key={tone} data-zone={tone}/>)}
            <b className="r1-combat-marker"/>
        </span>
    </span>
}
