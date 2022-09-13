import React from "react";

import { Client } from 'boardgame.io/react'

import { DEFAULT_DEBUG } from '../../constants/App'

import Board from '../../components/Board/Board'
import { SurfKingGame } from '../../game/SurfKingGame'

const SurfKingClient = Client({
  game: SurfKingGame,
  board: Board,
  debug: process.env.DEBUG || DEFAULT_DEBUG ? true : false,
  // multiplayer: { server: process.env.REACT_APP_SERVER },
})

const BoardPage = () => {
  return <SurfKingClient />
}

export default BoardPage