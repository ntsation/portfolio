import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Bio from './pages/Bio'
import Feed from './pages/Feed'
import Article from './pages/Article'

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/biografia" element={<Bio />} />
        <Route path="/projetos" element={<Feed kind="project" />} />
        <Route path="/open-source" element={<Feed kind="opensource" />} />
        <Route path="/r/:name" element={<Article />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  )
}
