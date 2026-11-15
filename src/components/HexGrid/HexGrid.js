import React, { useId } from 'react'
import { BOARD_LAYOUT } from '../../map/layout/boardLayout'
import manifest from '../../map/layout/board-layout.json'
import { seaColor } from '../../constants/Colors'

const radius = manifest.hexRadius
const halfHeight = Math.sqrt(3) * radius / 2
const points = [
    [radius, 0], [radius / 2, halfHeight], [-radius / 2, halfHeight],
    [-radius, 0], [-radius / 2, -halfHeight], [radius / 2, -halfHeight],
].map((point) => point.join(',')).join(' ')
const halfWidth = Math.max(...BOARD_LAYOUT.map(({ x }) => Math.abs(x))) + radius + .06
const halfDepth = Math.max(...BOARD_LAYOUT.map(({ z }) => Math.abs(z))) + halfHeight + .06

const HexGrid = ({ cellProps, renderCell, onHexClick, getRef }) => {
    const gridId = useId()

    return (
        <svg ref={getRef} viewBox={[-halfWidth, -halfDepth, 2 * halfWidth, 2 * halfDepth].join(' ')}>
            {BOARD_LAYOUT.map(({ id, x, z }) => {
                const { backgroundImage, style } = cellProps(id)
                const patternId = `${gridId}-cell-${id}`

                return (
                    <g key={id} transform={`translate(${x} ${z})`}>
                        {backgroundImage && (
                            <defs>
                                <pattern id={patternId} width="1" height="1" patternContentUnits="objectBoundingBox">
                                    <image href={backgroundImage} width="1" height="1" />
                                </pattern>
                            </defs>
                        )}
                        <polygon
                            points={points}
                            fill={backgroundImage ? `url(#${patternId})` : seaColor}
                            stroke="#d4f1eb"
                            strokeWidth=".045"
                            style={style}
                            onClick={() => onHexClick({ position: id })}
                        />
                        <svg x={-radius} y={-halfHeight} width={2 * radius} height={2 * halfHeight}
                            viewBox="0 0 400 340" style={{ pointerEvents: 'none' }}>
                            {renderCell(id)}
                        </svg>
                    </g>
                )
            })}
        </svg>
    )
}

export default HexGrid
