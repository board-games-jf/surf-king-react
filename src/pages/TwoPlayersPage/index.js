import { Client } from 'boardgame.io/react'
import { SurfKingGame } from '../../game/SurfKingGame'
import Board from '../../components/Board/Board'

// TODO add redux enhancer with redux-persist, so game can be resumed
const TwoPlayersPage = Client({
    game: SurfKingGame,
    board: Board,
    debug: true,
})

export default TwoPlayersPage
