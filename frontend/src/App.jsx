import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import WorkspacePage from './pages/WorkspacePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/workspace/:sandboxId" element={<WorkspacePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
