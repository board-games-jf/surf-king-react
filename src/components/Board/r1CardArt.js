import sunburn from '../../assets/cards/r1/sunburn.webp'
import bigwave from '../../assets/cards/r1/bigwave.webp'
import tsunami from '../../assets/cards/r1/tsunami.webp'
import amulet from '../../assets/cards/r1/amulet.webp'
import stone from '../../assets/cards/r1/stone.webp'
import storm from '../../assets/cards/r1/storm.webp'
import cyclone from '../../assets/cards/r1/cyclone.webp'
import island from '../../assets/cards/r1/island.webp'
import energyx2 from '../../assets/cards/r1/energyx2.webp'
import lifeguardfloat from '../../assets/cards/r1/lifeguardfloat.webp'
import jumping from '../../assets/cards/r1/jumping.webp'
import surfcurrent from '../../assets/cards/r1/surfcurrent.webp'
import change from '../../assets/cards/r1/change.webp'
import hangloose from '../../assets/cards/r1/hangloose.webp'
import shark from '../../assets/cards/r1/shark.webp'

// Presentation-only art and functional colors; gameplay remains in SurfKingR1.
export const cardArt = {
    'Sunburn': sunburn,
    'Big wave': bigwave,
    'Tsunami': tsunami,
    'Amulet': amulet,
    'Stone': stone,
    'Storm': storm,
    'Cyclone': cyclone,
    'Island': island,
    'Energy x2': energyx2,
    'Lifeguard float': lifeguardfloat,
    'Jumping': jumping,
    'Surf Current': surfcurrent,
    'Change': change,
    'Hang loose': hangloose,
}

export const cardTone = {
    'Sunburn': 'attack',
    'Big wave': 'attack',
    'Tsunami': 'attack',
    'Amulet': 'protection',
    'Stone': 'obstacle',
    'Storm': 'obstacle',
    'Cyclone': 'obstacle',
    'Island': 'obstacle',
    'Energy x2': 'recovery',
    'Lifeguard float': 'recovery',
    'Jumping': 'jump',
    'Surf Current': 'move',
    'Change': 'jump',
    'Hang loose': 'protection',
}

export const terrainArt = { Shark: shark, Stone: cardArt.Stone, Storm: cardArt.Storm, Cyclone: cardArt.Cyclone, Island: cardArt.Island }
