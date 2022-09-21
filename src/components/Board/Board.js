import React, { useEffect, useState } from 'react'
import { HexGrid } from '../HexGrid'
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

const Board = ({ G, ctx, moves }) => {
    const gameMode = 1
    const [placingObstacle, setPlacingObstacle] = useState(null)
    const [removingObstacle, setRemovingObstacle] = useState(null)
    const [selectPlayerTarget, setSelectPlayerTarget] = useState(null)
    const [selectTsunami, setSelectTsunami] = useState(null)

    useEffect(() => {
        console.log('Board::useEffect G', G)
    }, [G])

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

    const renderCell = (position) => {
        const cell = G.cells[position]

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
                        if (card.Name === cell.obstacle.Name && card.CellPosition === cell.obstacle.CellPosition) {
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
                {position}
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
        return <div style={{ height: 24 }}>{energies}</div>
    }

    const renderCardByName = (card, index, activeCards) => {
        const name = card.Name.replace(/\s+/g, '').toLowerCase()
        const src = require(`../../assets/cards/${name}.png`)
        const activeCard = activeCards.find((c) => c.Name === card.Name && c.CellPosition === card.CellPosition)
        const opacity = activeCard ? 0.5 : 1
        const remaningTurn = activeCard ? activeCard.RemaningTurn : 0
        return (
            <div style={{ position: 'relative', textAlign: 'center' }}>
                <img
                    key={`${name}_${index}`}
                    style={{ opacity }}
                    alt=""
                    src={src}
                    width="100"
                    onClick={() => onCardClickHandle(G, ctx, moves, gameMode, card, index)}
                />
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

    return (
        <div>
            <HexGrid cellProps={cellProps} renderCell={renderCell} onHexClick={onHexClickedHandle} />
            <div>
                <h3>{`[${G.turn}] - ${G.currentMove}: player ${parseInt(ctx.currentPlayer) + 1}'s turn`}</h3>
                {!placingObstacle && !removingObstacle && !selectPlayerTarget && !selectTsunami ? (
                    <>
                        <div
                            style={{
                                marginBottom: 20,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <button style={{ width: 100, height: 30 }} onClick={onSkipHandle}>
                                skip
                            </button>
                            <div>{renderDices(G)}</div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-evenly',
                                alignItems: 'center',
                            }}
                        >
                            {Object.values(G.players).map((p, index) => (
                                <div key={index} style={{ border: '1px solid black' }}>
                                    <div style={{ marginTop: 8 }}>
                                        {p.position === parseInt(ctx.currentPlayer) ? (
                                            <b>player {p.position + 1} cards</b>
                                        ) : (
                                            <>player {p.position + 1} cards</>
                                        )}
                                    </div>
                                    {renderPlayerEnergy(G.players[p.position].energy, p.position)}
                                    <div style={{ display: 'flex' }}>
                                        {G.players[p.position].cards.map((card, index) =>
                                            renderCardByName(card, index, G.players[p.position].activeCard)
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div>Click in one hex to choose one...</div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Board
