import React from 'react'

export default function PanelHeader({ title, onBack, backLabel, onClose, closeLabel }) {
    return <div className="r1-panel-header">
        {onBack ? <button type="button" className="r1-panel-header-action" aria-label={backLabel} onClick={onBack}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19 12H5m6-6-6 6 6 6"/></svg></button> : <span aria-hidden="true"/>}
        <strong>{title}</strong>
        {onClose ? <button type="button" className="r1-panel-header-action" aria-label={closeLabel} onClick={onClose}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button> : <span aria-hidden="true"/>}
    </div>
}
