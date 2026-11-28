import React, { useState } from 'react'
import { Client } from 'boardgame.io/react'
import { SurfKingGame } from '../../game/SurfKingGame'
import { SurfKingR1, SurfKingR1Adaptive } from '../../game/r1/SurfKingR1'
import Board from '../../components/Board/Board'
import LocalHistoryGame from './LocalHistoryGame'

const LocalPage = () => {
    const [numPlayers, setNumPlayers] = useState(0)
    const [ruleset, setRuleset] = useState('adaptive')

    const SufKingClient = () => {
        if (ruleset === 'adaptive' || ruleset === 'R1') return <LocalHistoryGame numPlayers={numPlayers} gameDefinition={ruleset === 'adaptive' ? SurfKingR1Adaptive : SurfKingR1} />
        const SKClient = Client({
            game: ruleset === 'R1' ? SurfKingR1 : SurfKingGame,
            numPlayers: numPlayers,
            board: Board,
            debug: false,
        })
        return <>{<SKClient />}</>
    }

    return (
        <>
            {numPlayers === 0 ? (
                <div style={{ margin: 'auto', width: '50%' }}>
                    <p>Select rules:</p>
                    <label>
                        <input type="radio" name="ruleset" checked={ruleset === 'adaptive'} onChange={() => setRuleset('adaptive')} />{' '}
                        R1.12.1 adaptive playtest
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="ruleset"
                            checked={ruleset === 'R1'}
                            onChange={() => setRuleset('R1')}
                        />{' '}
                        R1 reference pilot
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="ruleset"
                            checked={ruleset === 'legacy'}
                            onChange={() => setRuleset('legacy')}
                        />{' '}
                        Original rules
                    </label>
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
