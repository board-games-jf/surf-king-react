import React, { useId } from 'react'
import { BOARD_LAYOUT } from '../../map/layout/boardLayout'
import manifest from '../../map/layout/board-layout.json'
import { TARGET_BLOCK_SYMBOL_PATHS } from '../../map/contract/targetHighlight'
import { seaColor } from '../../constants/Colors'

const radius = manifest.hexRadius
const halfHeight = Math.sqrt(3) * radius / 2
const points = [
    [radius, 0], [radius / 2, halfHeight], [-radius / 2, halfHeight],
    [-radius, 0], [-radius / 2, -halfHeight], [radius / 2, -halfHeight],
].map((point) => point.join(',')).join(' ')
const halfWidth = Math.max(...BOARD_LAYOUT.map(({ x }) => Math.abs(x))) + radius + .06
const halfDepth = Math.max(...BOARD_LAYOUT.map(({ z }) => Math.abs(z))) + halfHeight + .06

const HexGrid = ({ cellProps, renderCell, onHexClick, onHexHover, inspectedCellId, getRef }) => {
    const gridId = useId()

    return (
        <svg ref={getRef} viewBox={[-halfWidth, -halfDepth, 2 * halfWidth, 2 * halfDepth].join(' ')}>
            {BOARD_LAYOUT.map(({ id, x, z }) => {
                const { backgroundImage, style, highlight, blocked } = cellProps(id)
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
                            data-cell-id={id}
                            data-inspected={inspectedCellId === id ? 'true' : undefined}
                            onMouseEnter={() => onHexHover?.(id)}
                            onMouseLeave={() => onHexHover?.(null)}
                            onClick={() => onHexClick({ position: id })}
                        />
                        {highlight && (
                            <polygon points={points} transform="scale(.91)"
                                fill={highlight.color} fillOpacity={highlight.preview ? .24 : .32}
                                stroke={highlight.color} strokeOpacity={highlight.preview ? .9 : 1}
                                strokeWidth=".10" strokeDasharray={highlight.preview ? '.12 .09' : undefined}
                                pointerEvents="none" data-target-highlight={highlight.kind}
                                data-target-preview={highlight.preview ? 'true' : 'false'} />
                        )}
                        {blocked && <polygon points={points} transform="scale(.91)" fill={blocked.color}
                            fillOpacity=".07" stroke={blocked.color} strokeOpacity=".85" strokeWidth=".075"
                            strokeDasharray=".14 .10" pointerEvents="none" data-target-blocked={blocked.code}/>}
                        <svg x={-radius} y={-halfHeight} width={2 * radius} height={2 * halfHeight}
                            viewBox="0 0 400 340" style={{ pointerEvents: 'none' }}>
                            {renderCell(id)}
                        </svg>
                        {blocked && <svg x={radius * .25} y={-halfHeight * .88} width={radius * .52} height={radius * .52}
                            viewBox="0 0 1 1" pointerEvents="none" aria-label={blocked.reason || blocked.label}>
                            <circle cx=".5" cy=".5" r=".48" fill="#153640" stroke={blocked.color} strokeWidth=".045"/>
                            {TARGET_BLOCK_SYMBOL_PATHS[blocked.symbol].map((path, i) => <polyline key={i}
                                points={path.map(p => p.join(',')).join(' ')} fill="none" stroke={blocked.color}
                                strokeWidth=".10" strokeLinecap="round" strokeLinejoin="round"/>)}
                        </svg>}
                    </g>
                )
            })}
        </svg>
    )
}

export default HexGrid
