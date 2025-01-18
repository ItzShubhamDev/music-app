import { useEffect, useState } from 'react'
import Player from './components/Player'
import Playlist from './components/Playlist'
import { Music } from './types'
import Search from './components/Search'
import Navbar from './components/Navbar'
import Settings from './components/Settings'
import { SettingsIcon } from 'lucide-react'

const App = () => {
  const [music, setMusic] = useState<Music | null>(null)
  const [playlist, setPlaylist] = useState<Music[]>([])
  const [queue, setQueue] = useState<Music[]>([])
  const [history, setHistory] = useState<Music[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [settingsHidden, setSettingsHidden] = useState(true)

  useEffect(() => {
    const playlist = localStorage.getItem('playlist') || '[]'
    setPlaylist(JSON.parse(playlist))
    const music = localStorage.getItem('music')
    if (music) setMusic(JSON.parse(music))
  }, [])

  useEffect(() => {
    if (music) localStorage.setItem('music', JSON.stringify(music))
  }, [music])

  useEffect(() => {
    if (playlist.length > 0) {
      localStorage.setItem('playlist', JSON.stringify(playlist))
    }
  }, [playlist])

  return (
    <div className="h-screen w-full">
      <Navbar
        color={colors.length > 0 ? colors[0] : '#6b7280'}
        title={music?.name || 'Music Player'}
      />
      <div
        className="h-full relative flex items-center justify-center w-full bg-blend-multiply overflow-hidden bg-gray-900"
        style={{
          background: `linear-gradient(to left, ${colors.join(
            ', '
          )}), linear-gradient(to bottom, rgb(17, 24, 39), rgb(17, 24, 39, 0.8))`
        }}
      >
        <Search
          setMusic={setMusic}
          setQueue={setQueue}
          color={colors.length > 0 ? colors[0] : '#6b7280'}
        />
        <Player
          music={music}
          setMusic={setMusic}
          queue={queue}
          setQueue={setQueue}
          history={history}
          setHistory={setHistory}
          colors={colors}
          setColors={setColors}
        />
        <Playlist
          music={music}
          setMusic={setMusic}
          queue={queue}
          setQueue={setQueue}
          setHistory={setHistory}
          playlist={playlist}
          setPlaylist={setPlaylist}
          color={colors.length > 0 ? colors[0] : '#6b7280'}
        />
        <Settings hidden={settingsHidden} setHidden={setSettingsHidden} />
        <button
          onClick={() => setSettingsHidden(!settingsHidden)}
          className="fixed bottom-4 right-4 text-white focus:rotate-90 transition-transform duration-500"
        >
          <SettingsIcon />
        </button>
      </div>
    </div>
  )
}

export default App
