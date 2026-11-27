import React from 'react'

export default function CloseButton({ className = '', label, onClick }) {
    return (
        <button type="button" className={`r1-close-button ${className}`} aria-label={label} onClick={onClick}>
            <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="m6 6 12 12M18 6 6 18" />
            </svg>
        </button>
    )
}
