import React from 'react'
import { PLAYER_BOARD_COLORS } from '../../constants/playerBoardColors'
import './R1Hud.css'

export default function PlayerIcon({ playerId, variant = '' }) {
    return (
        <span
            className={'r1-player-avatar' + (variant ? ' ' + variant : '')}
            aria-hidden="true"
            style={{ '--r1-player-color': PLAYER_BOARD_COLORS[playerId % PLAYER_BOARD_COLORS.length] }}
        >
            {playerId + 1}
        </span>
    )
}
