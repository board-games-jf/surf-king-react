import React from 'react'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'
// import AiPage from './pages/Ai'

import ErrorPage from './pages/Error'
import HomePage from './pages/HomePage'
import TwoPlayersPage from './pages/TwoPlayersPage'

const AppRoutes = () => (
    // Hash router is used because of github-pages issues with browser router
    <Router>
        <Routes>
            <Route exact path="/" element={<HomePage />} />
            {/* <Route path="/ai" element={<AiPage />} /> */}
            <Route path="/two-players" element={<TwoPlayersPage />} />
            {/* <Route path="/online" element={LoadableOnlinePage} /> */}
            <Route path="*" element={ErrorPage} />
        </Routes>
    </Router>
)

export default AppRoutes
