import React, { useId } from 'react'
import { BOARD_LAYOUT } from '../../map/layout/boardLayout'
import manifest from '../../map/layout/board-layout.json'
import { TARGET_BLOCK_SYMBOL_PATHS, getMixedTargetBorderPaths, getHexHoverColors, HEX_SELECTION_COLOR } from '../../map/contract/targetHighlight'
import { HEX_STATUS_COLORS, HEX_HAZARD_GLYPHS } from '../../map/contract/hexStatus'
import { seaColor } from '../../constants/Colors'
import './HexGrid.css'

const radius = manifest.hexRadius
const halfHeight = Math.sqrt(3) * radius / 2
const points = [
    [radius, 0], [radius / 2, halfHeight], [-radius / 2, halfHeight],
    [-radius, 0], [-radius / 2, -halfHeight], [radius / 2, -halfHeight],
].map((point) => point.join(',')).join(' ')
const mixedBorderPaths = getMixedTargetBorderPaths(radius).map(path => path.map(point => point.join(',')).join(' '))
const halfWidth = Math.max(...BOARD_LAYOUT.map(({ x }) => Math.abs(x))) + radius + .06
const halfDepth = Math.max(...BOARD_LAYOUT.map(({ z }) => Math.abs(z))) + halfHeight + .06

const HexGrid = ({ cellProps, renderCell, onHexClick, onHexHover, inspectedCellId, hoveredCellId, selectedCellId, getRef }) => {
    const gridId = useId()

    return (
        <svg className="surf-hex-grid" ref={getRef} viewBox={[-halfWidth, -halfDepth, 2 * halfWidth, 2 * halfDepth].join(' ')}>
            {BOARD_LAYOUT.map(({ id, x, z }) => {
                const { backgroundImage, style, highlight, attackHighlight, blocked, status } = cellProps(id)
                const patternId = `${gridId}-cell-${id}`
                const mixed = !!(highlight && attackHighlight)
                const hoverColors = getHexHoverColors(highlight?.color, attackHighlight?.color, blocked?.color)
                const selected = selectedCellId === id

                return (
                    <g key={id} transform={`translate(${x} ${z})`} data-hex-hover={hoveredCellId === id ? 'true' : undefined}>
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
                            onClick={(event) => {
                                const polygon = event.currentTarget, matrix = polygon.getScreenCTM?.()
                                const corners = matrix && polygon.points ? Array.from(polygon.points, point => ({ x: matrix.a * point.x + matrix.c * point.y + matrix.e, y: matrix.b * point.x + matrix.d * point.y + matrix.f })) : null
                                if (corners) onHexClick({ position: id }, corners)
                                else onHexClick({ position: id })
                            }}
                        />
                        {status?.blocked && <polygon points={points} transform="scale(.96)" fill="#15313a"
                            fillOpacity=".48" pointerEvents="none" data-hex-blocked="true"/>}
                        {status?.danger && <g pointerEvents="none" data-hex-danger="true">
                            <polygon points={points} transform="scale(.81)" fill="none" stroke={HEX_STATUS_COLORS.danger}
                                strokeWidth={status.lethal ? '.075' : '.045'} strokeDasharray=".14 .10" className="hex-danger-outline"/>
                            {(status.activeDanger || selected || hoveredCellId === id) && <circle r={radius * .75} fill="none"
                                stroke={HEX_STATUS_COLORS.danger} strokeWidth=".035" className="hex-danger-ripple"/>}
                        </g>}
                        {highlight && !mixed && (
                            <polygon points={points} transform="scale(.91)"
                                fill={highlight.color} fillOpacity={highlight.preview ? .24 : .32}
                                stroke={highlight.color} strokeOpacity={highlight.preview ? .9 : 1}
                                strokeWidth=".10" strokeDasharray={highlight.preview ? '.12 .09' : undefined}
                                pointerEvents="none" data-target-highlight={highlight.kind}
                                data-target-preview={highlight.preview ? 'true' : 'false'} />
                        )}
                        {attackHighlight && !mixed && <polygon points={points} transform={highlight ? 'scale(.76)' : 'scale(.91)'}
                            fill={attackHighlight.color} fillOpacity={highlight ? .18 : .36} stroke={attackHighlight.color} strokeOpacity="1"
                            strokeWidth=".10" pointerEvents="none" data-target-highlight="attack"/>}
                        {mixed && <g transform="scale(.91)" pointerEvents="none" data-mixed-target-border="true">
                            {[highlight, { ...attackHighlight, kind: 'attack' }].map((option, index) =>
                                <React.Fragment key={index}>
                                    <polyline points={mixedBorderPaths[index]} fill="none" stroke={option.color}
                                        strokeWidth=".20" strokeOpacity=".24" strokeLinejoin="round"/>
                                    <polyline points={mixedBorderPaths[index]} fill="none" stroke={option.color}
                                        strokeWidth=".075" strokeLinejoin="round" pointerEvents="none"
                                        data-target-highlight={option.kind} data-target-preview={option.preview ? 'true' : 'false'}/>
                                </React.Fragment>)}
                        </g>}
                        {blocked && <polygon points={points} transform={mixed ? "scale(.81)" : "scale(.91)"} fill={blocked.color}
                            fillOpacity=".07" stroke={blocked.color} strokeOpacity=".85" strokeWidth=".075"
                            strokeDasharray=".14 .10" pointerEvents="none" data-target-blocked={blocked.code}/>}
                        {selected && <g pointerEvents="none" data-hex-selection="true">
                            {[0, 1].map(i => <circle key={i} cx="0" cy="0" r={radius * .75} fill="none" stroke="#d8fff2" strokeWidth=".025" className="hex-selection-ripple" style={{ animationDelay: i ? '-.9s' : '0s' }}/>)}
                            <polygon points={points} fill="none" stroke={HEX_SELECTION_COLOR} strokeWidth=".19" strokeOpacity=".22"/>
                            <polygon points={points} fill="none" stroke={HEX_SELECTION_COLOR} strokeWidth=".065"/>
                        </g>}
                        {onHexHover && <g className="hex-hover-glow" transform={highlight || attackHighlight || blocked ? 'scale(.91)' : 'scale(.97)'} pointerEvents="none">
                            {hoverColors.map((color, index) => <React.Fragment key={index}>
                                <polyline points={mixedBorderPaths[index]} fill="none" stroke={color} strokeWidth=".20" strokeOpacity=".5" strokeLinejoin="round"/>
                                <polyline points={mixedBorderPaths[index]} fill="none" stroke={color} strokeWidth=".075" strokeLinejoin="round"/>
                            </React.Fragment>)}
                        </g>}
                        <svg x={-radius} y={-halfHeight} width={2 * radius} height={2 * halfHeight}
                            viewBox="0 0 400 340" style={{ pointerEvents: 'none' }}>
                            {renderCell(id)}
                        </svg>
                        {status && <g pointerEvents="none" className="hex-status-badges">
                            {status.danger && <g transform={`translate(${-radius * .55} ${-halfHeight * .45})`} aria-label={status.lethal ? 'Entry will cause a fall' : 'Terrain hazard'}>
                                <svg x={-radius * .23} y={-radius * .23} width={radius * .46} height={radius * .46} viewBox="0 0 1 1" data-hazard-medallion={status.terrain || 'generic'}>
                                    <circle cx=".5" cy=".5" r=".48" fill="#ff6868" opacity=".22"/>
                                    <circle cx=".5" cy=".5" r=".43" fill="#713a40" stroke="#ffc099" strokeWidth=".055"/>
                                    {(HEX_HAZARD_GLYPHS[status.terrain] || TARGET_BLOCK_SYMBOL_PATHS.danger).map((path, index) =>
                                        <polyline key={index} points={path.map(p => p.join(',')).join(' ')} fill="none" stroke="#ffd0ae" strokeWidth=".062" strokeLinecap="round" strokeLinejoin="round"/>)}
                                </svg>
                            </g>}
                            {status.blocked && <g transform={`translate(0 ${-halfHeight * .72})`} aria-label={status.full ? 'Hex full' : 'No eligible action'}>
                                <rect x="-.11" y="-.035" width=".22" height=".17" rx=".035" fill={HEX_STATUS_COLORS.blocked}/>
                                <path d="M-.075 -.035 V-.095 A.075 .075 0 0 1 .075 -.095 V-.035" stroke={HEX_STATUS_COLORS.blocked} strokeWidth=".035" fill="none"/>
                            </g>}
                        </g>}
                        {blocked && blocked.playerId == null && <svg x={radius * .25} y={-halfHeight * .88} width={radius * .52} height={radius * .52}
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
