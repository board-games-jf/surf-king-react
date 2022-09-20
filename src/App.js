import { useEffect, useState } from 'react'
import './App.css'
import initLocale from './initLocale'
import AppRoutes from './Routes'
import { LinearProgress } from './components/LinearProgress'

function App() {
    const [loadingLocales, setLoadingLocales] = useState(true)

    useEffect(() => {
        initLocale().then(() => setLoadingLocales(false))
    })

    return (
        <>
            {loadingLocales ? (
                <LinearProgress color="secondary" />
            ) : (
                <div className="App">
                    <AppRoutes />
                </div>
            )}
        </>
    )
}

export default App
