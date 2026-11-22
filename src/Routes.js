import React from 'react'
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
// import AiPage from './pages/Ai'

import ErrorPage from './pages/Error'
import HomePage from './pages/HomePage'
import LocalPage from './pages/LocalPage'
import ObstacleGalleryPage from './pages/ObstacleGalleryPage'
import BoardCatalogPage from './pages/BoardCatalogPage'
import ArtReviewPage from './pages/ArtReviewPage'

const AppRoutes = () => (
    // Hash router is used because of github-pages issues with browser router
    <Router>
        <Routes>
            <Route exact path="/" element={<HomePage />} />
            {/* <Route path="/ai" element={<AiPage />} /> */}
            <Route path="/local" element={<LocalPage />} />
            <Route path="/obstacles" element={<ObstacleGalleryPage />} />
            <Route path="/catalog" element={<BoardCatalogPage />} />
            <Route path="/surfers" element={<Navigate to="/customize" replace />} />
            <Route path="/customize" element={<ArtReviewPage />} />
            <Route path="/art-review" element={<Navigate to="/customize" replace />} />
            {/* <Route path="/online" element={LoadableOnlinePage} /> */}
            <Route path="*" element={ErrorPage} />
        </Routes>
    </Router>
)

export default AppRoutes
