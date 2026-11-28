import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Client } from 'boardgame.io/client'
import { SurfKingR1 } from '../../game/r1/SurfKingR1'
import Board from '../../components/Board/Board'
import './LocalHistoryGame.css'

// RESET restores the complete local boardgame.io state, including its random plugin.
export const restoreState = (client, state) => client.store.dispatch({ type: 'RESET', state, clientOnly: true })

function describe(state) {
    const entry = (state.deltalog || []).find((item) => item.action?.type === 'MAKE_MOVE')
    const move = entry?.action?.payload?.type
    const player = entry?.action?.payload?.playerID
    const names = {
        quickManeuver: 'Move',
        maneuver: 'Move',
        dropIn: 'Drop In',
        useCard: 'Play card',
        recover: 'Recover',
        pass: 'Pass',
    }
    const label =
        names[move] || (move ? move.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()) : 'Game update')
    const destination =
        ['quickManeuver', 'maneuver'].includes(move) && Number.isInteger(entry?.action?.payload?.args?.[0])
            ? ' · Hex ' + (entry.action.payload.args[0] + 1)
            : ''
    return (player == null ? '' : 'P' + (Number(player) + 1) + ' · ') + label + destination
}

export default function LocalHistoryGame({ numPlayers }) {
    const client = useMemo(() => Client({ game: SurfKingR1, numPlayers, debug: false }), [numPlayers])
    const initial = useMemo(() => client.store.getState(), [client])
    const [game, setGame] = useState(() => client.getState())
    const [nodes, setNodes] = useState(() => [{ id: 0, parent: null, state: initial, label: 'Match started' }])
    const [branches, setBranches] = useState([{ id: 0, name: 'Original', head: 0 }])
    const [activeBranch, setActiveBranch] = useState(0)
    const [viewBranch, setViewBranch] = useState(0)
    const [preview, setPreview] = useState(null)
    const [open, setOpen] = useState(false)
    const cursor = useRef({
        node: 0,
        branch: 0,
        nextNode: 1,
        nextBranch: 1,
        restoring: false,
        stateID: initial._stateID,
    })
    const noMoves = useMemo(() => Object.fromEntries(Object.keys(client.moves).map((key) => [key, () => {}])), [client])

    useEffect(() => {
        const unsubscribe = client.subscribe(() => {
            const state = client.store.getState()
            setGame(client.getState())
            const current = cursor.current
            if (current.restoring || state._stateID === current.stateID) return
            current.stateID = state._stateID
            const id = current.nextNode++
            const parent = current.node
            current.node = id
            setNodes((items) => [...items, { id, parent, state, label: describe(state) }])
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
                <Board key={selected ? 'preview' : 'live'} {...boardState} moves={selected ? noMoves : client.moves} />
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
                                            onClick={() => setPreview(item.id)}
                                        >
                                            <span>Round {item.state.G.turn || 1}</span>
                                            <strong>{item.label}</strong>
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
