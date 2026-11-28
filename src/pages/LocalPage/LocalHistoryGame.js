import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Client } from 'boardgame.io/client'
import { SurfKingR1 } from '../../game/r1/SurfKingR1'
import Board from '../../components/Board/Board'
import PlayerIcon from '../../components/Board/PlayerIcon'
import R1Card from '../../components/Board/R1Card'
import { FeedbackIcon, HexBadge, EffectChip } from '../../components/Board/r1FeedbackVisuals'
import { cardArt, cardTone } from '../../components/Board/r1CardArt'
import './LocalHistoryGame.css'

// RESET restores the complete local boardgame.io state, including its random plugin.
export const restoreState = (client, state) => client.store.dispatch({ type: 'RESET', state, clientOnly: true })

export function describeAction(state, previous) {
    const entry = (state.deltalog || []).find((item) => item.action?.type === 'MAKE_MOVE')
    const payload = entry?.action?.payload
    const move = payload?.type
    const player = payload?.playerID ?? (move ? previous?.ctx?.currentPlayer : null)
    const args = payload?.args || []
    const names = {
        quickManeuver: 'Move',
        maneuver: 'Move',
        dropIn: 'Drop In',
        useCard: 'Play card',
        recover: 'Recover',
        pass: 'Pass',
        resolveSwap: 'Position choice',
    }
    const playerId = id => id != null && id !== '' && Number.isInteger(Number(id)) && Number(id) >= 0 && Number(id) < 7 ? Number(id) : null
    const targetDetail = id => ({ kind: 'player', playerId: playerId(id) })
    const hexDetail = (id, landed = false) => ({ kind: 'hex', id, landed })
    const hexLabel = id => Number.isInteger(id) && id >= 0 && id < 53 ? 'Hex ' + (id + 1) : ''
    let label = names[move] || (move ? move.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()) : 'Game update')
    const details = []
    let cardName = null
    if (move === 'useCard') {
        // Read the original hand index before consumption; the next hand may include a draw.
        const card = previous?.G?.players?.[player]?.cards?.[args[0]]
        const event = state.G?.cardVisualEvent
        const freshEvent = event && event.id != null && previous?.G &&
            event.id !== previous.G.cardVisualEvent?.id && String(event.playerId) === String(player) &&
            (!card || card.Name === event.name) ? event : null
        const name = card?.Name || freshEvent?.name
        if (name) { cardName = name; label += ': ' + name }
        const target = freshEvent?.targetId ?? args[2]
        const destination = freshEvent?.to ?? args[1]
        if (playerId(target) !== null) details.push(targetDetail(target))
        if (hexLabel(destination)) details.push(hexDetail(destination))
    } else if (['quickManeuver', 'maneuver'].includes(move)) {
        if (hexLabel(args[0])) details.push(hexDetail(args[0]))
        const landing = state.G?.players?.[player]?.cellPosition
        if (hexLabel(landing) && landing !== args[0]) details.push(hexDetail(landing, true))
    } else if (move === 'dropIn') {
        const result = state.G?.dropResult
        const target = result?.defenderId ?? args[2]
        if (playerId(target) !== null) details.push(targetDetail(target))
        if (hexLabel(args[0])) details.push(hexDetail(args[0]))
        if (result && String(result.attackerId) === String(player)) {
            if (result.attackerLoss === 0 && result.defenderLoss === 0) details.push({ kind: 'result', text: 'Tie' })
            else {
                if (result.attackerLoss > 0) details.push({ kind: 'energy', delta: -result.attackerLoss, subject: 'own' })
                if (result.defenderLoss > 0) details.push({ kind: 'energy', delta: -result.defenderLoss, subject: 'target' })
            }
        }
    } else if (move === 'resolveSwap') {
        if (args[0] === true) {
            label = 'Swap positions'
            const target = previous?.G?.pendingSwap?.targetPlayerId
            if (playerId(target) !== null) details.push(targetDetail(target))
        } else if (args[0] === false) label = 'Stay'
    } else if (move === 'recover') {
        details.push({ kind: 'energy', delta: 1 })
    }
    return { playerId: playerId(player), move, cardName, label, details }
}

function energyText(detail) {
    return (detail.delta < 0 ? '−' : '+') + Math.abs(detail.delta) + (detail.subject ? ' ' + detail.subject : '') + ' energy'
}

function formatAction(action) {
    const playerLabel = id => id == null ? '' : 'P' + (id + 1)
    const details = action.details.map(detail => {
        if (detail.kind === 'player') return playerLabel(detail.playerId)
        if (detail.kind === 'hex') return (detail.landed ? 'Landed ' : '') + 'Hex ' + (detail.id + 1)
        if (detail.kind === 'energy') return energyText(detail)
        return detail.text
    })
    return [playerLabel(action.playerId), action.label, ...details].filter(Boolean).join(' · ')
}

export function describe(state, previous) {
    return formatAction(describeAction(state, previous))
}

const moveVisual = {
    quickManeuver: { icon: 'move', tone: 'move' },
    maneuver: { icon: 'move', tone: 'move' },
    dropIn: { icon: 'dice', tone: 'attack' },
    useCard: { icon: 'cards', tone: 'card' },
    recover: { icon: 'energy', tone: 'recovery' },
    resolveSwap: { icon: 'move', tone: 'jump' },
    pass: { icon: 'clock', tone: 'neutral' },
}

function HistoryDetail({ detail }) {
    if (detail.kind === 'player') return (
        <span className="r1-history-detail"><FeedbackIcon kind="target" />
            <PlayerIcon playerId={detail.playerId} variant="r1-history-target" />
        </span>
    )
    if (detail.kind === 'hex') return (
        <span className="r1-history-detail">
            {detail.landed && <FeedbackIcon kind="move" />}
            <HexBadge id={detail.id} />
        </span>
    )
    if (detail.kind === 'energy') return (
        <EffectChip kind="energy" tone={detail.delta < 0 ? 'bad' : 'good'}>
            {(detail.delta < 0 ? '−' : '+') + Math.abs(detail.delta)}{detail.subject ? ' ' + detail.subject : ''}
        </EffectChip>
    )
    return <EffectChip kind="balanced">{detail.text}</EffectChip>
}

// The shared visual primitives keep history consistent with the game HUD.
export function HistoryAction({ action, round }) {
    const visual = moveVisual[action.move] || { icon: 'flag', tone: 'neutral' }
    const tone = cardTone[action.cardName] || visual.tone
    const hasArtwork = Boolean(cardArt[action.cardName])
    return (
        <span className="r1-history-entry" data-tone={tone} aria-hidden="true">
            <span className="r1-history-identity">
                {action.playerId !== null
                    ? <PlayerIcon playerId={action.playerId} variant="r1-history-actor" />
                    : <span className="r1-history-system-icon"><FeedbackIcon kind="flag" /></span>}
            </span>
            <span className="r1-history-entry-copy">
                <span className="r1-history-round">Round {round}</span>
                <strong className="r1-history-action-text">
                    <FeedbackIcon kind={visual.icon} />
                    {action.cardName || action.label}
                </strong>
                {action.details.length > 0 && <span className="r1-history-details">
                    {action.details.map((detail, i) => <HistoryDetail key={i} detail={detail} />)}
                </span>}
            </span>
            {hasArtwork && <R1Card name={action.cardName} variant="thumbnail" className="r1-history-card-art" />}
        </span>
    )
}

export default function LocalHistoryGame({ numPlayers }) {
    const client = useMemo(() => Client({ game: SurfKingR1, numPlayers, debug: false }), [numPlayers])
    const initial = useMemo(() => client.store.getState(), [client])
    const [game, setGame] = useState(() => client.getState())
    const [nodes, setNodes] = useState(() => [{ id: 0, parent: null, state: initial, action: { playerId: null, move: null, cardName: null, label: 'Match started', details: [] } }])
    const [branches, setBranches] = useState([{ id: 0, name: 'Original', head: 0 }])
    const [activeBranch, setActiveBranch] = useState(0)
    const [viewBranch, setViewBranch] = useState(0)
    const [preview, setPreview] = useState(null)
    // Preserve the chosen renderer when switching between live and historical snapshots.
    const [viewMode, setViewMode] = useState('3d')
    const [open, setOpen] = useState(false)
    const cursor = useRef({
        node: 0,
        branch: 0,
        nextNode: 1,
        nextBranch: 1,
        restoring: false,
        stateID: initial._stateID,
        state: initial,
    })
    const noMoves = useMemo(() => Object.fromEntries(Object.keys(client.moves).map((key) => [key, () => {}])), [client])

    useEffect(() => {
        const unsubscribe = client.subscribe(() => {
            const state = client.store.getState()
            setGame(client.getState())
            const current = cursor.current
            if (current.restoring || state._stateID === current.stateID) return
            const previous = current.state
            current.stateID = state._stateID
            current.state = state
            const id = current.nextNode++
            const parent = current.node
            current.node = id
            const action = describeAction(state, previous)
            const round = previous?.G?.turn ?? state.G.turn
            setNodes((items) => [...items, { id, parent, state, action, round }])
            setBranches((items) =>
                items.map((branch) => (branch.id === current.branch ? { ...branch, head: id } : branch))
            )
        })
        client.start()
        return () => {
            unsubscribe()
            client.stop()
        }
    }, [client])

    const resume = (node) => {
        const current = cursor.current
        const id = current.nextBranch++
        current.restoring = true
        current.node = node.id
        current.branch = id
        current.stateID = node.state._stateID
        current.state = node.state
        restoreState(client, node.state)
        current.restoring = false
        setBranches((items) => [...items, { id, name: 'Branch ' + id, head: node.id }])
        setActiveBranch(id)
        setViewBranch(id)
        setPreview(null)
        setGame(client.getState())
    }
    const selectedBranch = branches.find((branch) => branch.id === viewBranch) || branches[0]
    const path = []
    let node = nodes.find((item) => item.id === selectedBranch.head)
    while (node) {
        path.unshift(node)
        const parentId = node.parent
        node = nodes.find((item) => item.id === parentId)
    }
    const selected = nodes.find((item) => item.id === preview)
    const boardState = selected ? { ...game, ...selected.state } : game
    if (!boardState) return null
    return (
        <div className="bgio-client r1-local-history-game">
            <div className={selected ? 'r1-history-preview-board' : undefined}>
                <Board key={selected ? 'preview' : 'live'} {...boardState} moves={selected ? noMoves : client.moves}
                    viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
            <aside className="r1-history" aria-label="Match history">
                {open && (
                    <section className="r1-history-panel">
                        <header>
                            <strong>Match history</strong>
                            <button
                                type="button"
                                aria-label="Minimize history"
                                onClick={() => {
                                    setOpen(false)
                                    setPreview(null)
                                }}
                            >
                                −
                            </button>
                        </header>
                        <label>
                            Timeline{' '}
                            <select
                                value={viewBranch}
                                onChange={(event) => {
                                    setViewBranch(Number(event.target.value))
                                    setPreview(null)
                                }}
                            >
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                        {branch.id === activeBranch ? ' · playing' : ''}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <ol>
                            {path
                                .slice()
                                .reverse()
                                .map((item) => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            aria-pressed={preview === item.id}
                                            aria-label={'Round ' + (item.round ?? item.state.G.turn ?? 1) + ' · ' + formatAction(item.action)}
                                            onClick={() => setPreview(item.id)}
                                        >
                                            <HistoryAction action={item.action} round={item.round ?? item.state.G.turn ?? 1} />
                                        </button>
                                    </li>
                                ))}
                        </ol>
                        {selected && (
                            <div className="r1-history-actions">
                                <span>Previewing a past state</span>
                                <button type="button" onClick={() => setPreview(null)}>
                                    Back to game
                                </button>
                                <button type="button" onClick={() => resume(selected)}>
                                    Play from here
                                </button>
                            </div>
                        )}
                        <small>Timelines are kept for this local session.</small>
                    </section>
                )}
                <button
                    type="button"
                    className="r1-history-toggle"
                    aria-expanded={open}
                    onClick={() => {
                        setOpen(!open)
                        if (open) setPreview(null)
                    }}
                >
                    ↶ <span>History</span>
                </button>
            </aside>
        </div>
    )
}
