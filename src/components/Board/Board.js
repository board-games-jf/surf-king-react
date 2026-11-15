import React, { useEffect, useState } from 'react'
import { HexGrid } from '../HexGrid'
import './Board.css'
import Board3D from '../../map/views/Board3D/Board3D'
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

        if (cell.player) {
            // TODO: Implement
        }

        if (cell.obstacle) {
            const name = cell.obstacle.Name.replace(/\s+/g, '').toLowerCase()
            const img = require(`../../assets/obstacles/${name}.png`)
            return { backgroundImage: img }
        }

        return { style: { fill: seaColor } }
    }

    const renderCell = (cellPosition) => {
        const cell = G.cells[cellPosition]

        if (cell.player) {
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

    const onSkipHandle = () => moves.pass(G, ctx)

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

    useEffect(() => {
        if (skipPress) {
            onSkipHandle()
        }
    }, [skipPress])

    useEffect(() => {
        console.log('Board::useEffect G', G)
    }, [G])

    const choosingTarget = placingObstacle || removingObstacle || selectPlayerTarget || selectTsunami
    return (
        <div className="surf-match">
            <div className="surf-map-toolbar" aria-label="Board view">
                <button type="button" aria-pressed={viewMode === '2d'} onClick={() => setViewMode('2d')}>2D</button>
                <button type="button" aria-pressed={viewMode === '3d'} onClick={() => { setViewError(null); setViewMode('3d') }}>3D</button>
                {viewError && <span role="alert">{viewError}</span>}
            </div>
            <div className={'surf-map surf-map-' + viewMode}>
                {viewMode === '3d' ? (
                    <Board3D
                        snapshot={createPublicMapSnapshot(G, ctx, selectedCellId)}
                        onCellSelect={(cellId) => { setSelectedCellId(cellId); onHexClickedHandle({ position: cellId }) }}
                        onUnavailable={(message) => { setViewError(message); setViewMode('2d') }}
                    />
                ) : (
                    <HexGrid cellProps={cellProps} renderCell={renderCell}
                        onHexClick={(cell) => { setSelectedCellId(cell.position); onHexClickedHandle(cell) }}
                    />
                )}
            </div>
            <section className="surf-hud" aria-label="Match controls">
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
            </section>
        </div>
    )
}

export default Board
