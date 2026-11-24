import React, { useCallback, useEffect, useRef, useState } from 'react'
import { HexGrid } from '../HexGrid'
import './Board.css'
import Board3D from '../../map/views/Board3D/Board3D'
import R1Controls from './R1Controls'
import { getR1HexFeedback } from './r1HexFeedback'
import { getR1TargetHighlight, r1SelectionTargets, r1SelectionPlayerTargets } from './r1TargetHighlight'
import { r1Occupants } from '../../game/r1/SurfKingR1'
import { PLAYER_BOARD_COLORS } from '../../constants/playerBoardColors'
import { getTargetHighlightStyle, getTargetBlockStyle } from '../../map/contract/targetHighlight'
import { createPublicMapSnapshot } from '../../map/contract/createPublicMapSnapshot'
import { seaColor } from '../../constants/Colors'
import {
    CardAmulet,
    CardBigWave,
    CardBottledWater,
    CardChange,
    CardCoconut,
    CardCyclone,
    CardEnergy,
    CardEnergyX2,
    CardEnergyX3,
    CardHangLoose,
    CardIsland,
    CardJumping,
    CardLifeGuardFloat,
    CardShark,
    CardStone,
    CardStorm,
    CardSunburn,
    CardSwimmingFin,
    CardTsunami,
} from '../../game/Cards'

import EnergyImage from '../../assets/energy.png'
import { MOVE_DROP_IN, MOVE_MANEUVER } from '../../game/SurfKingGame'

// TODO: Move to another file
const useKeyPress = function (targetKey) {
    const [keyPressed, setKeyPressed] = useState(false)

    function downHandler({ key }) {
        if (key === targetKey) {
            setKeyPressed(true)
        }
    }

    const upHandler = ({ key }) => {
        if (key === targetKey) {
            setKeyPressed(false)
        }
    }

    React.useEffect(() => {
        window.addEventListener('keydown', downHandler)
        window.addEventListener('keyup', upHandler)

        return () => {
            window.removeEventListener('keydown', downHandler)
            window.removeEventListener('keyup', upHandler)
        }
    })

    return keyPressed
}

const Board = ({ G, ctx, moves }) => {
    const gameMode = 1
    const isR1 = G.ruleset === 'R1'
    const [r1Selection, setR1Selection] = useState(null)
    const [r1CardPreview, setR1CardPreview] = useState(null)
    const previewId = r1CardPreview?.playerId === ctx.currentPlayer && r1CardPreview?.turn === G.turn ?
        r1CardPreview.cardId : null
    const previewCard = cardId => setR1CardPreview(cardId == null ? null :
        { cardId, playerId: ctx.currentPlayer, turn: G.turn })
    const r1Targets = isR1 ? r1SelectionTargets(G, ctx, r1Selection) : []
    const r1PlayerTargets = isR1 ? r1SelectionPlayerTargets(G, ctx, r1Selection) : []
    const targetHighlight = isR1 ? getR1TargetHighlight(G, ctx, r1Selection, previewId) : null
    const [hoveredHex, setHoveredHex] = useState(null)
    const [clickedHex, setClickedHex] = useState(null)
    const inspectionScope = ctx.currentPlayer + ':' + G.turn + ':' + G.currentMove + ':' +
        (r1Selection?.kind || '') + ':' + (r1Selection?.index ?? '')
    const pinnedHexId = clickedHex?.scope === inspectionScope ? clickedHex.id : null
    const inspectedHexId = hoveredHex ?? pinnedHexId
    const clearHexInspection = () => { setClickedHex(null); setHoveredHex(null) }
    const hexFeedback = isR1 ? getR1HexFeedback(G, ctx, inspectedHexId, r1Selection, targetHighlight) : null
    const onR1Target = (id, playerId) => {
        const candidates = r1PlayerTargets.filter(pid => G.players[pid].cellPosition === id)
        // Multiple legal occupants require an explicit named player choice.
        if (candidates.length > 1 && playerId === undefined) {
            setClickedHex({ id, scope: inspectionScope })
            return
        }
        if (playerId !== undefined && !candidates.includes(playerId)) return
        const chosen = playerId ?? candidates[0]
        if (!r1Targets.includes(id)) {
            setClickedHex(previous => previous?.scope === inspectionScope && previous.id === id ? null : { id, scope: inspectionScope })
            return
        }
        setClickedHex(null)
        setHoveredHex(null)
        if (r1Selection?.kind === 'card') moves.useCard(r1Selection.index, id, chosen)
        else if (r1Selection?.kind === 'drop') moves.dropIn(id, r1Selection.diceCount, chosen)
        else moves.maneuver(id)
        setR1CardPreview(null)
        setR1Selection(null)
    }
    const [viewMode, setViewMode] = useState('2d')
    const [selectedCellId, setSelectedCellId] = useState(null)
    const [viewError, setViewError] = useState(null)

    const [placingObstacle, setPlacingObstacle] = useState(null)
    const [removingObstacle, setRemovingObstacle] = useState(null)
    const [selectPlayerTarget, setSelectPlayerTarget] = useState(null)
    const [selectTsunami, setSelectTsunami] = useState(null)

    const skipPress = useKeyPress('s')

    const cellProps = (position) => {
        const cell = G.cells[position]
        const targetStyle = isR1 && r1Targets.includes(position) ? { cursor: 'pointer' } : {}
        const blocked = targetHighlight?.blocked?.find(item => item.id === position)
        const highlight = targetHighlight?.cellIds.includes(position) ? {
            ...getTargetHighlightStyle(targetHighlight.kind), kind: targetHighlight.kind, preview: targetHighlight.preview,
        } : null

        if (cell.player) {
            // TODO: Implement
        }

        if (cell.obstacle) {
            const name = cell.obstacle.Name.replace(/\s+/g, '').toLowerCase()
            const img = require(`../../assets/obstacles/${name}.png`)
            return { backgroundImage: img, style: targetStyle, highlight, blocked: blocked ? { ...blocked, ...getTargetBlockStyle(blocked.code) } : null }
        }

        return { style: { fill: seaColor, ...targetStyle }, highlight, blocked: blocked ? { ...blocked, ...getTargetBlockStyle(blocked.code) } : null }
    }

    const renderCell = (cellPosition) => {
        const cell = G.cells[cellPosition]
        if (isR1) {
            const occupants = r1Occupants(G, cellPosition)
            if (occupants.length) return <>
                {occupants.map((p, slot) => {
                    const x = occupants.length === 1 ? 200 : slot === 0 ? 115 : 285
                    const current = G.winner == null && String(p.position) === String(ctx.currentPlayer)
                    const block = targetHighlight?.blocked?.find(item => item.playerId === p.position)
                    const valid = r1PlayerTargets.includes(p.position)
                    return <g key={p.position} data-surfer-id={p.position} transform={`translate(${x},170)`}>
                        <circle r={occupants.length === 1 ? 65 : 52} fill={PLAYER_BOARD_COLORS[p.position]}
                            stroke={current ? '#ffcf53' : valid ? '#ff9882' : '#173d36'} strokeWidth={current || valid ? 12 : 5}
                            opacity={p.energy === 0 ? .55 : 1}/>
                        <text y="18" fontSize={54} fontWeight="bold" fill="#173d36" textAnchor="middle">{p.position + 1}</text>
                        {current && <text y="-82" fontSize={34} fontWeight="bold" fill="#fff4c5" textAnchor="middle">NOW</text>}
                        <text y="94" fontSize={34} fontWeight="bold" fill="#fff4c5" stroke="#173d36" strokeWidth="2" textAnchor="middle">{p.energy}/5</text>
                        {block && <text x="49" y="-46" fontSize={42} fontWeight="bold" fill={getTargetBlockStyle(block.code).color} stroke="#173d36" strokeWidth="2" textAnchor="middle">{block.code === 'minimum' ? '1' : ['protected','hangloose'].includes(block.code) ? '◆' : '×'}</text>}
                    </g>
                })}
            </>
        }
        if (!isR1 && cell.player) {
            return (
                <text x="50%" y="50%" fontSize={80} style={{ fill: 'black' }} textAnchor="middle">
                    {`#${cell.player.position + 1}`}
                </text>
            )
        }

        if (cell.obstacle) {
            if (cell.obstacle.Name === CardStone.Name) {
                let elem = null
                Object.values(G.players).forEach((p) =>
                    p.activeCard.forEach((card) => {
                        if (card.Name === cell.obstacle.Name && card.CellPosition === cellPosition) {
                            elem = (
                                <text
                                    x="50%"
                                    y="92%"
                                    fontSize={80}
                                    style={{ fill: 'gray', fontWeight: 'bold' }}
                                    textAnchor="middle"
                                >
                                    {card.RemaningTurn}
                                </text>
                            )
                        }
                    })
                )
                return elem
            }
            return
        }

        return (
            <text x="50%" y="50%" fontSize={80} style={{ fill: 'white' }} textAnchor="middle">
                {cellPosition + 1}
            </text>
        )
    }

    const onHexClickedHandle = (cell) => {
        if (isR1) { onR1Target(cell.position); return }
        if (placingObstacle != null) {
            moves.useCard(placingObstacle.cardPos, [cell.position])
            setPlacingObstacle(null)
        } else if (removingObstacle != null) {
            moves.useCard(removingObstacle.cardPos, [cell.position])
            setRemovingObstacle(null)
        } else if (selectPlayerTarget != null) {
            moves.useCard(selectPlayerTarget.cardPos, [cell.position])
            setSelectPlayerTarget(null)
        } else if (selectTsunami != null) {
            if ([7, 14, 21, 28, 35, 42].includes(cell.position)) {
                moves.useCard(selectTsunami.cardPos, [cell.position])
                setSelectTsunami(null)
            }
        } else {
            if (G.currentMove === MOVE_MANEUVER) {
                const currentPlayer = ctx.currentPlayer
                const currentPlayerPosition = G.players[currentPlayer].cellPosition
                const nextPosition = cell.position

                return moves.maneuver(currentPlayerPosition, nextPosition)
            } else if (G.currentMove === MOVE_DROP_IN) {
                return moves.dropIn(cell.position)
            }
        }
    }

    const onSkipHandle = useCallback(() => moves.pass(G, ctx), [moves, G, ctx])

    const onCardClickHandle = (G, ctx, moves, mode, card, cardPos, args) => {
        switch (card.Name) {
            case CardCyclone.Name:
            case CardIsland.Name:
            case CardStone.Name:
            case CardStorm.Name:
            case CardShark.Name:
                setPlacingObstacle({ card, cardPos })
                break
            case CardBigWave.Name:
            case CardSunburn.Name:
            case CardChange.Name:
                setSelectPlayerTarget({ card, cardPos })
                break
            case CardBottledWater.Name:
            case CardCoconut.Name:
            case CardEnergy.Name:
            case CardEnergyX2.Name:
            case CardEnergyX3.Name:
            case CardHangLoose.Name:
            case CardLifeGuardFloat.Name:
            case CardSwimmingFin.Name:
            case CardAmulet.Name:
                moves.useCard(cardPos, args)
                break
            case CardJumping.Name:
                setRemovingObstacle({ card, cardPos })
                break
            case CardTsunami.Name:
                setSelectTsunami({ card, cardPos })
                break
            default:
                break
        }
    }

    const renderPlayerEnergy = (quantity, playerPosition) => {
        var energies = []
        for (let i = 0; i < quantity; ++i) {
            energies.push(<img key={`energy_${playerPosition}_${i}`} alt="" src={EnergyImage} width={24} />)
        }
        return <div className="surf-energy" aria-label={quantity + " energy"}>{energies}</div>
    }

    const renderCardByName = (card, index, activeCards) => {
        const name = card.Name.replace(/\s+/g, '').toLowerCase()
        const src = require(`../../assets/cards/${name}.png`)
        const activeCard = activeCards.find((c) => c.Name === card.Name && c.CellPosition === card.CellPosition)
        const opacity = activeCard ? 0.5 : 1
        const remaningTurn = activeCard ? activeCard.RemaningTurn : 0
        return (
            <div className="surf-card" key={index}>
                <button type="button" aria-label={card.Name} title={card.Name}
                    onClick={() => onCardClickHandle(G, ctx, moves, gameMode, card, index)}>
                    <img style={{ opacity }} alt="" src={src} />
                </button>
                {remaningTurn > 0 && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'white',
                            width: 18,
                            height: 18,
                            borderRadius: 18,
                            textAlign: 'center',
                        }}
                    >
                        {remaningTurn}
                    </div>
                )}
            </div>
        )
    }

    const renderDices = (G) => {
        return (
            G.atkDices?.length > 0 && (
                <div style={{ textAlign: 'left' }}>
                    <div>atk: {G.atkDices.join(' ')}</div>
                    <div>def: {G.defDices.join(' ')}</div>
                </div>
            )
        )
    }

    const skipWasPressed = useRef(false)
    useEffect(() => {
        const newPress = skipPress && !skipWasPressed.current
        skipWasPressed.current = skipPress
        if (newPress && !isR1) onSkipHandle()
    }, [skipPress, onSkipHandle, isR1])

    useEffect(() => { setR1Selection(null) }, [ctx.currentPlayer, G.turn, G.currentMove])

    const choosingTarget = placingObstacle || removingObstacle || selectPlayerTarget || selectTsunami
    return (
        <div className={isR1 ? "surf-match surf-match-r1" : "surf-match"}>
            <div className="surf-map-toolbar" aria-label="Board view">
                <button type="button" aria-pressed={viewMode === '2d'} onClick={() => { setHoveredHex(null); setViewMode('2d') }}>2D</button>
                <button type="button" aria-pressed={viewMode === '3d'} onClick={() => { setHoveredHex(null); setViewError(null); setViewMode('3d') }}>3D</button>
                {viewError && <span role="alert">{viewError}</span>}
            </div>
            <div className={'surf-map surf-map-' + viewMode}>
                {viewMode === '3d' ? (
                    <Board3D
                        snapshot={isR1 ? { ...createPublicMapSnapshot(G, ctx, pinnedHexId), maneuverDestinations: r1Targets, targetHighlight } : createPublicMapSnapshot(G, ctx, selectedCellId)}
                        onCellHover={isR1 ? setHoveredHex : undefined}
                        onCellSelect={(cellId) => { setSelectedCellId(cellId); onHexClickedHandle({ position: cellId }) }}
                        onUnavailable={(message) => { setHoveredHex(null); setViewError(message); setViewMode('2d') }}
                    />
                ) : (
                    <HexGrid cellProps={cellProps} renderCell={renderCell}
                        onHexHover={isR1 ? setHoveredHex : undefined} inspectedCellId={isR1 ? inspectedHexId : null}
                        onHexClick={(cell) => { setSelectedCellId(cell.position); onHexClickedHandle(cell) }}
                    />
                )}
            </div>
            {isR1 ? <R1Controls G={G} ctx={ctx} moves={moves} selection={r1Selection}
                setSelection={setR1Selection} onTarget={onR1Target} targetHighlight={targetHighlight} onPreviewCard={previewCard} hexFeedback={hexFeedback} pinnedHex={pinnedHexId != null} onClearHex={clearHexInspection} /> : <section className="surf-hud" aria-label="Match controls">
                <div className="surf-turn">
                    <strong aria-live="polite">{'Turn ' + G.turn + ' · Player ' + (Number(ctx.currentPlayer) + 1) + ' · ' + G.currentMove.replace(/_/g, ' ')}</strong>
                    {choosingTarget ? <span>Choose a hex</span> : (
                        <>
                            {renderDices(G)}
                            <button type="button" onClick={onSkipHandle}>Skip</button>
                        </>
                    )}
                </div>
                {!choosingTarget && <div className="surf-hands">
                    {Object.values(G.players).map((player) => (
                        <div key={player.position} className="surf-hand" data-current={String(player.position) === ctx.currentPlayer}>
                            <div className="surf-hand-heading">
                                <strong>{'Player ' + (player.position + 1)}</strong>
                                {renderPlayerEnergy(player.energy, player.position)}
                            </div>
                            <div className="surf-cards">
                                {player.cards.map((card, index) => renderCardByName(card, index, player.activeCard))}
                            </div>
                        </div>
                    ))}
                </div>}
            </section>}
        </div>
    )
}

export default Board
