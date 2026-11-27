import React from 'react'
import CloseButton from './CloseButton'

export default function PanelHeader({ title, onBack, backLabel, onClose, closeLabel }) {
    return (
        <div className="r1-panel-header">
            {onBack ? (
                <button type="button" className="r1-panel-header-action" aria-label={backLabel} onClick={onBack}>
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M19 12H5m6-6-6 6 6 6" />
                    </svg>
                </button>
            ) : (
                <span aria-hidden="true" />
            )}
            <strong>{title}</strong>
            {onClose ? (
                <CloseButton className="r1-panel-header-action" label={closeLabel} onClick={onClose} />
            ) : (
                <span aria-hidden="true" />
            )}
        </div>
    )
}
