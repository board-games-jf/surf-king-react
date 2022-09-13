import React from "react";

import { Client } from 'boardgame.io/react'

import { DEFAULT_DEBUG } from '../../constants/App'

import Board from '../../components/Board/Board'
import { SurfKingGame, NUMBER_OF_PLAYERS } from '../../game/SurfKingGame'

const SurfKingClient = Client({
  game: SurfKingGame,
  numPlayers: NUMBER_OF_PLAYERS,
  board: Board,
  debug: process.env.DEBUG || DEFAULT_DEBUG ? true : false,
  // multiplayer: { server: process.env.REACT_APP_SERVER },
})

const BoardPage = () => {
  return <SurfKingClient />
}

export default BoardPage