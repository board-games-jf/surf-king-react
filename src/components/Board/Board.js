import React, { useEffect, useState } from "react";
import { HexGrid } from '../HexGrid'
import { seaColor } from "../../constants/Colors";
import { UseCardAction, HexClickAction } from "../../game/Game";
import { CardAmulet, CardBigWave, CardBottledWater, CardChange, CardCoconut, CardCyclone, CardEnergy, CardEnergyX2, CardEnergyX3, CardHangLoose, CardIsland, CardJumping, CardLifeGuardFloat, CardShark, CardStone, CardStorm, CardSunburn, CardSwimmingFin, CardTsunami } from "../../game/Cards";

const Board = ({ G, ctx, moves }) => {
    const gameMode = 1;
    const [placingObstacle, setPlacingObstacle] = useState(null);

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
        console.log("onHexClickedHandle", placingObstacle);
        if (placingObstacle != null) {
            UseCardAction(G, ctx, moves, gameMode, placingObstacle.cardPos, [cell.position]);
            setPlacingObstacle(null);
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

    const onSkipHandle = () => moves.skip(G, ctx);

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
                UseCardAction(G, ctx, moves, mode, cardPos, args)
                break
            case CardChange.Name:
                break
            case CardJumping.Name:
                break
            case CardSunburn.Name:
                break
            case CardTsunami.Name:
                break
            default:
                break;
        }
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
                {!placingObstacle ? (<>
                    <div style={{ marginBottom: 20 }}>
                        <button style={{ width: 100, height: 30 }} onClick={onGoForItHandle}>go for it</button>
                        <button style={{ width: 100, height: 30 }} onClick={onSkipHandle}>skip</button>
                    </div>
                    <div>
                        {Object.values(G.players).map((p, index) => (
                            <div key={index}>
                                <h4>player {p.position + 1} cards</h4>
                                {G.players[p.position].cards.map(renderCardByName)}
                            </div>
                        ))}
                    </div>
                </>) : (<>
                    <div>Click in one hex to choose a place...</div>
                </>)
                }
            </div>
        </div>
    )
}

export default Board;