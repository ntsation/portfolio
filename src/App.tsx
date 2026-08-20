import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import DotGridBackground from './components/DotGridBackground'
import Home from './pages/Home'
import Bio from './pages/Bio'
import Feed from './pages/Feed'
import Article from './pages/Article'
import Lab from './pages/Lab'

export default function App() {
  return (
    <>
      <DotGridBackground />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/biografia" element={<Bio />} />
        <Route path="/projetos" element={<Feed kind="project" />} />
        <Route path="/open-source" element={<Feed kind="opensource" />} />
        <Route path="/r/:name" element={<Article />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  )
}
