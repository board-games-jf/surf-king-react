import React from 'react'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'

import ErrorPage from './pages/Error'
import Loadable from 'react-loadable'
import { LinearProgress } from './components/LinearProgress'
import HomePage from './pages/HomePage'
import TwoPlayersPage from './pages/TwoPlayersPage'

const Loading = (props) => (props.error ? <ErrorPage /> : <LinearProgress color="secondary" />)

const LoadableHomePage = Loadable({
    loader: () => import('./pages/HomePage'),
    loading: Loading,
})

const LoadableTwoPlayersPage = Loadable({
    loader: () => import('./pages/TwoPlayersPage'),
    loading: Loading,
})

const AppRoutes = () => (
    // Hash router is used because of github-pages issues with browser router
    <Router>
        <Routes>
            <Route exact path="/" element={<HomePage />} />
            {/* <Route path="/ai" element={LoadableAiPage} /> */}
            <Route path="/two-players" element={<TwoPlayersPage />} />
            {/* <Route path="/online" element={LoadableOnlinePage} /> */}
            <Route path="*" element={ErrorPage} />
        </Routes>
    </Router>
)

export default AppRoutes
