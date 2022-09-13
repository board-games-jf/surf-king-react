import { Server } from 'boardgame.io/server'
import { DEFAULT_LOBBY_PORT, DEFAULT_SERVER_PORT } from '../constants/App'
import { SurfKingGame } from '../game/SurfKingGame'

const PORT = Number(process.env.PORT || DEFAULT_SERVER_PORT)
const API_PORT = Number(process.env.API_PORT || DEFAULT_LOBBY_PORT)

const server = Server({ games: [SurfKingGame] })

const lobbyConfig = {
  apiPort: API_PORT,
  apiCallback: () => console.log(`Running Lobby API on port ${API_PORT}...`),
}

server.run({ port: PORT, lobbyConfig }, () => {
  console.log(`Serving at: http://localhost:${PORT}/`)
})