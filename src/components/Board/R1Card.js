import React from 'react'
import { cardArt, cardTone } from './r1CardArt'

// Shared face for interactive and read-only cards; contextual panels use its thumbnail.
export default function R1Card({ name, variant = 'full', interactive = false, className = '', description, children, ...props }) {
    if (variant === 'thumbnail') {
        return <img className={'r1-card-thumbnail ' + className} src={cardArt[name]} alt="" draggable={false} {...props} />
    }
    const Tag = interactive ? 'button' : 'div'
    return (
        <Tag {...props} type={interactive ? 'button' : undefined}
            className={('r1-card-view ' + className).trim()} data-card-tone={cardTone[name]}>
            {children}
            <img className="r1-card-art" src={cardArt[name]} alt="" draggable={false} />
            <strong>{name}</strong>
            {description && <span className="r1-sr-only">{description}</span>}
        </Tag>
    )
}
