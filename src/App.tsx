import { AnimatePresence, motion } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AllElementsPage from './pages/AllElementsPage'
import ElementPage from './pages/ElementPage'
import HomePage from './pages/HomePage'

function AnimatedRoutes() {
  const location = useLocation()
  // Key on the page type (not the full path) so prev/next keeps the same 3D canvas alive.
  const pageKey = location.pathname.startsWith('/element/') ? 'element' : location.pathname

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 14, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.99 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/elements" element={<AllElementsPage />} />
          <Route path="/element/:symbol" element={<ElementPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
