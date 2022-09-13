import React, { useEffect } from "react";
import { HexGrid } from '../HexGrid'
import { seaColor } from "../../constants/Colors";
import { CardClickAction, HexClickAction } from "../../game/Game";

// TODO: Move to other place
import SharkObstacleImage from '../../assets/shark400.png';

const Board = ({ G, ctx, moves }) => {
    useEffect(() => {
        console.log("Board::useEffect G", G);
    }, [G])

    const cellProps = (position) => {
        const cell = G.cells[position];

        if (cell.player) {
            // TODO: Implement
        }

        if (cell.obstacle) {
            return { backgroundImage: SharkObstacleImage }
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
        HexClickAction(G, ctx, moves, 1, cell);
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

    const renderCardByName = (card, cardPos) => {
        const name = card.Name.replace(/\s+/g, '').toLowerCase();
        const src = require(`../../assets/cards/${name}.png`);
        return (<img key={`${name}_${cardPos}`} alt="" src={src} width="100" onClick={() => CardClickAction(G, ctx, moves, 1, cardPos)} />)
    }

    return (
        <div>
            <HexGrid cellProps={cellProps} renderCell={renderCell} onHexClick={onHexClickedHandle} />
            <div>
                <h2>{`${ctx.phase}: player ${ctx.currentPlayer}`}</h2>
                <div style={{ marginBottom: 20 }}>
                    <button style={{ width: 100, height: 30 }} onClick={onGoForItHandle}>go for it</button>
                    <button style={{ width: 100, height: 30 }} onClick={onSkipHandle}>skip</button>
                </div>
                <div>
                    {G.players[ctx.currentPlayer].cards.map((card, index) => (renderCardByName(card, index)))}
                </div>
            </div>
        </div>
    )
}

export default Board;