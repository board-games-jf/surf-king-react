import React from 'react'
import { CHANGE_RANGE, r1AttackRange, r1PlacementRange } from '../../game/r1/SurfKingR1'
export { terrainArt } from './r1CardArt'

export function HexBadge({ id }) {
    return <span className="r1-hex-badge" aria-hidden="true">{id + 1}</span>
}

export function FeedbackIcon({ kind }) {
    const paths = {
        energy: <path d="M13 2 4 14h7l-1 8 10-13h-7z" fill="currentColor" stroke="none"/>,
        range: <><path d="m12 2 9 5v10l-9 5-9-5V7z"/><circle cx="12" cy="12" r="3"/></>,
        move: <><path d="M3 12h17m-6-6 6 6-6 6"/></>,
        dropIn: <><path d="M2 19c4-5 7-5 11-1s6 3 9 0"/><path d="m6 4 9 9m-6 0h6V7"/></>,
        shield: <path d="m12 3 8 3v6c0 5-4 8-8 10-4-2-8-5-8-10V6z"/>,
        swirl: <path d="M21 8c-2-5-12-5-15 0-4 6 5 12 10 7 4-4-3-7-5-3m-8 5c3 5 12 5 16 0"/>,
        check: <path d="m5 12 4 4L19 6"/>,
        active: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></>,
        favorable: <path d="m3 16 6-6 4 4 8-8m-6 0h6v6"/>,
        balanced: <path d="M5 12h14"/>,
        unfavorable: <path d="m3 8 6 6 4-4 8 8m-6 0h6v-6"/>,
        clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></>,
        lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
        cards: <><rect x="7" y="4" width="12" height="16" rx="2"/><path d="M5 7H4v12a2 2 0 0 0 2 2h10"/></>,
        target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3"/></>,
        blocked: <><circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/></>,
        warning: <><path d="m12 3 10 18H2z"/><path d="M12 9v5m0 3v1"/></>,
        wave: <path d="M2 15c4-9 7-9 11-3s6 5 9 1M2 20c4-5 7-5 11-2s6 3 9 0"/>,
        flag: <><path d="M5 22V3m0 1c6-5 10 5 15 0v11c-5 5-9-5-15 0"/></>,
    }
    return <svg className="r1-feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind] || paths.wave}</svg>
}

export function EffectChip({ kind, children, tone }) {
    return <span className="r1-effect-chip" data-tone={tone}><FeedbackIcon kind={kind}/>{children}</span>
}

const cardEffects = {
    'Energy x2': ['energy', '+2', 'good'],
    'Lifeguard float': ['energy', 'Recover to 3', 'good'],
    'Big wave': ['energy', 'Up to −2', 'bad'],
    Sunburn: ['energy', '−1', 'bad'],
    Tsunami: ['energy', 'Up to −3', 'bad'],
    Stone: ['energy', 'Entry −1 · Once', 'bad'],
    Storm: ['energy', 'Entry −1', 'bad'],
    Cyclone: ['swirl', 'Random redirect'],
    Island: ['energy', 'Entry +2', 'good'],
    Jumping: ['shield', 'Ignore hazard', 'good'],
    Amulet: ['shield', 'Until next turn', 'good'],
    Change: ['move', 'Swap · replaces move', 'good'],
    'Hang loose': ['shield', 'Drop In only', 'good'],
    'Surf Current': ['move', 'Up to 2 steps', 'good'],
}
export const cardEffectKind = name => cardEffects[name]?.[0] || 'wave'

export function CardEffects({ name, G = {} }) {
    const effect = cardEffects[name]
    const range = (name === 'Change' ? CHANGE_RANGE : r1AttackRange(G, name)) || r1PlacementRange(G, name) || (name === 'Jumping' ? 1 : 0)
    return <div className="r1-effect-row">
        {range > 0 && <EffectChip kind="range">{r1PlacementRange(G, name) ? 'Place: ' : ''}{range} {range === 1 ? 'hex' : 'hexes'}</EffectChip>}
        {effect && <EffectChip kind={effect[0]} tone={effect[2]}>{effect[1]}</EffectChip>}
        {r1AttackRange(G, name) && <span className="r1-effect-note">Min. 1 energy</span>}
    </div>
}
export function HexEffects({ info }) {
    const safe = info.entry.startsWith('Safe landing')
    const effects = { Shark: ['energy', '−2 energy', 'bad'], Stone: ['energy', '−1 · Once', 'bad'], Storm: ['energy', '−1 energy', 'bad'], Island: ['energy', '+2 energy', 'good'], Cyclone: ['swirl', 'Random redirect'], Beach: ['flag', 'Finish'] }
    const effect = safe ? ['shield', 'Safe landing', 'good'] : effects[info.title]
    return <div className="r1-effect-row">
        {effect && <EffectChip kind={effect[0]} tone={effect[2]}>{effect[1]}</EffectChip>}
        {!effect && !info.occupant && <EffectChip kind="wave">Clear water</EffectChip>}
        {info.risk && <EffectChip kind="warning" tone="bad">Fall risk</EffectChip>}
    </div>
}

export function compactReason(reason) {
    if (!reason) return ''
    if (reason === 'Attacks unlock in round 2.') return 'Round 2 onward'
    if (reason === 'Only usable after falling.') return 'After a fall only'
    if (reason === 'No unoccupied adjacent hazard.') return 'No adjacent hazard'
    if (reason.startsWith('No free obstacle-free')) return 'No valid placement'
    if (reason.startsWith('Unprotected opponents in range')) return '1 energy · Drop In only'
    if (reason === 'Nearby standing opponents are protected by Amulet.') return 'Protected by Amulet'
    if (reason === 'Nearby opponents are fallen or finished.') return 'No standing targets'
    if (reason === 'Energy already full (5/5).') return 'Energy full'
    if (reason === 'Your swap already used your movement.') return 'Movement used'
    if (reason === 'Choose whether to swap positions first.') return 'Resolve swap first'
    if (reason === 'Recover before playing this card.') return 'Recover first'
    return reason
}
export function compactHexAction(info) {
    const action = info.action
    if (action.startsWith('Click to place')) return 'Place here'
    if (action.startsWith('Click to attempt Drop In')) return 'Drop In'
    if (action.startsWith('Click to use')) return 'Attack here'
    if (action === 'Click to move here.') return 'Move here'
    if (action === 'Click to jump here.') return 'Jump here'
    if (action.startsWith('Select this hex to move')) return 'Move here'
    if (action.startsWith('Select Drop In')) return 'Select Drop In'
    if (action === 'Outside placement range.') return 'Out of range'
    if (action === 'This hex is not available for movement now.') return 'Not reachable'
    if (action === 'Not a valid target for this attack.') return 'Invalid target'
    if (action === 'Only Drop In can finish this opponent.') return 'Drop In only'
    if (action === 'Movement already used; play a card or end turn.') return 'Movement used'
    if (action === 'Choose whether to swap positions first.') return 'Resolve swap first'
    if (action === 'Confirm the selected card first.') return 'Confirm card first'
    return action
}
