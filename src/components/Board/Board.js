import React, { useEffect, useState } from "react";
import { HexGrid } from '../HexGrid'
import { seaColor } from "../../constants/Colors";
import { UseCardAction, HexClickAction } from "../../game/Game";
import { CardAmulet, CardBigWave, CardBottledWater, CardChange, CardCoconut, CardCyclone, CardEnergy, CardEnergyX2, CardEnergyX3, CardHangLoose, CardIsland, CardJumping, CardLifeGuardFloat, CardShark, CardStone, CardStorm, CardSunburn, CardSwimmingFin, CardTsunami } from "../../game/Cards";

import EnergyImage from '../../assets/energy.png'

const Board = ({ G, ctx, moves }) => {
    const gameMode = 1;
    const [placingObstacle, setPlacingObstacle] = useState(null);
    const [removingObstacle, setRemovingObstacle] = useState(null);
    const [selectPlayerTarget, setSelectPlayerTarget] = useState(null);
    const [selectTsunami, setSelectTsunami] = useState(null);

    useEffect(() => {
        console.log("Board::useEffect G", G);
    }, [G])

    const cellProps = (position) => {
        const cell = G.cells[position];

        if (cell.player) {
            // TODO: Implement
        }

        if (cell.obstacle) {
            const name = cell.obstacle.Name.replace(/\s+/g, '').toLowerCase();
            const img = require(`../../assets/obstacles/${name}.png`);
            return { backgroundImage: img }
        }

        return { style: { fill: seaColor } }
    }

    const renderCell = (position) => {
        const cell = G.cells[position];

        if (cell.player) {
            return (
                <text
                    x="50%"
                    y="50%"
                    fontSize={80}
                    style={{ fill: "black" }}
                    textAnchor="middle"
                >
                    {`P-${cell.player.position + 1}`}
                </text>
            )
        }

        if (cell.obstacle) {
            return;
        }

        return (
            <text
                x="50%"
                y="50%"
                fontSize={80}
                style={{ fill: "white" }}
                textAnchor="middle"
            >
                {position}
            </text>
        )
    }

    const onHexClickedHandle = (cell) => {
        if (placingObstacle != null) {
            UseCardAction(G, ctx, moves, gameMode, placingObstacle.card, placingObstacle.cardPos, [cell.position]);
            setPlacingObstacle(null);
        } else if (removingObstacle != null) {
            UseCardAction(G, ctx, moves, gameMode, removingObstacle.card, removingObstacle.cardPos, [cell.position]);
            setRemovingObstacle(null);
        } else if (selectPlayerTarget != null) {
            UseCardAction(G, ctx, moves, gameMode, selectPlayerTarget.card, selectPlayerTarget.cardPos, [cell.position]);
            setSelectPlayerTarget(null);
        } else if (selectTsunami != null) {
            if ([7, 14, 21, 28, 35, 42].includes(cell.position)) {
                UseCardAction(G, ctx, moves, gameMode, selectTsunami.card, selectTsunami.cardPos, [cell.position]);
                setSelectTsunami(null);
            }
        } else {
            HexClickAction(G, ctx, moves, gameMode, cell);
        }
    }

    const onGoForItHandle = () => {
        switch (ctx.phase) {
            case 'to_get_on_the_board':
                moves.toGetOnTheBoard(G, ctx);
                break;
            case 'receive_card':
                moves.getCard(G, ctx);
                break;
            default:
                break;
        }
    }

    const onSkipHandle = () => moves.pass(G, ctx);

    const onCardClickHandle = (G, ctx, moves, mode, card, cardPos, args) => {
        switch (card.Name) {
            case CardCyclone.Name:
            case CardIsland.Name:
            case CardStone.Name:
            case CardStorm.Name:
            case CardShark.Name:
                setPlacingObstacle({ card, cardPos });
                break;
            case CardBigWave.Name:
            case CardSunburn.Name:
            case CardChange.Name:
                setSelectPlayerTarget({ card, cardPos });
                break;
            case CardBottledWater.Name:
            case CardCoconut.Name:
            case CardEnergy.Name:
            case CardEnergyX2.Name:
            case CardEnergyX3.Name:
            case CardHangLoose.Name:
            case CardLifeGuardFloat.Name:
            case CardSwimmingFin.Name:
            case CardAmulet.Name:
                UseCardAction(G, ctx, moves, mode, card, cardPos, args);
                break;
            case CardJumping.Name:
                setRemovingObstacle({ card, cardPos });
                break;
            case CardTsunami.Name:
                setSelectTsunami({ card, cardPos });
                break;
            default:
                break;
        }
    }

    const renderPlayerEnergy = (quantity, playerPosition) => {
        var energies = [];
        for (let i = 0; i < quantity; ++i) {
            energies.push(<img key={`energy_${playerPosition}_${i}`} alt="" src={EnergyImage} width={24} />);
        }
        return <div>{energies}</div>;
    }

    const renderCardByName = (card, index) => {
        const name = card.Name.replace(/\s+/g, '').toLowerCase();
        const src = require(`../../assets/cards/${name}.png`);
        return (<img key={`${name}_${index}`} alt="" src={src} width="100" onClick={() => onCardClickHandle(G, ctx, moves, gameMode, card, index)} />)
    }

    return (
        <div>
            <HexGrid cellProps={cellProps} renderCell={renderCell} onHexClick={onHexClickedHandle} />
            <div>
                <h3>{`[${G.turn + 1}] - ${ctx.phase}: player ${parseInt(ctx.currentPlayer) + 1}'s turn`}</h3>
                {!placingObstacle && !removingObstacle && !selectPlayerTarget && !selectTsunami ? (<>
                    <div style={{ marginBottom: 20 }}>
                        <button style={{ width: 100, height: 30 }} onClick={onGoForItHandle}>go for it</button>
                        <button style={{ width: 100, height: 30 }} onClick={onSkipHandle}>skip</button>
                    </div>
                    <div>
                        {Object.values(G.players).map((p, index) => (
                            <div key={index}>
                                <h5>player {p.position + 1} cards</h5>
                                {renderPlayerEnergy(G.players[p.position].energy, p.position)}
                                {G.players[p.position].cards.map(renderCardByName)}
                            </div>
                        ))}
                    </div>
                </>) : (<>
                    <div>Click in one hex to choose one...</div>
                </>)
                }
            </div>
        </div>
    )
}

export default Board;