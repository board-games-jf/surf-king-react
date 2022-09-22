import React, { useState } from 'react'
import { Client } from 'boardgame.io/react'
import { SurfKingGame } from '../../game/SurfKingGame'
import Board from '../../components/Board/Board'

const LocalPage = () => {
    const [numPlayers, setNumPlayers] = useState(0)

    const SufKingClient = () => {
        // TODO add redux enhancer with redux-persist, so game can be resumed
        const SKClient = Client({
            game: SurfKingGame,
            numPlayers: numPlayers,
            board: Board,
            debug: true,
        })
        return <>{<SKClient />}</>
    }

    return (
        <>
            {numPlayers === 0 ? (
                <div style={{ margin: 'auto', width: '50%' }}>
                    <p>Select number of players:</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {Array.from({ length: 6 }, (_, index) => (
                            <button key={index} onClick={() => setNumPlayers(index + 2)}>
                                {index + 2}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <SufKingClient />
                </div>
            )}
        </>
    )
}

export default LocalPage
