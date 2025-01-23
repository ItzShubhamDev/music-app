import { ArrowUp, ChevronLeft, ChevronRight, ListVideo, Play, SearchIcon } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import type { SongDetailed } from 'ytmusic-api'
import { Music } from '../types'
import { Tooltip } from 'react-tooltip'
import hexToRgba from '@renderer/utils/hexToRgba'

const Search = ({
  setMusic,
  setQueue,
  color
}: {
  setMusic: React.Dispatch<React.SetStateAction<Music | null>>
  setQueue: React.Dispatch<React.SetStateAction<Music[]>>
  color: string
}) => {
  const ipcRenderer = window.electron.ipcRenderer
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SongDetailed[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [hidden, setHidden] = useState(true)

  const search = async () => {
    if (query === '') return
    const data = await ipcRenderer.invoke('search', query)
    setResults(data)
    setQuery('')
    setSuggestions([])
  }

  const suggestionSearch = async (suggestion: string) => {
    if (suggestion === '') return
    setQuery('')
    const data = await ipcRenderer.invoke('search', suggestion)
    setResults(data)
    setSuggestions([])
  }

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query === '') return setSuggestions([])
      const data = await ipcRenderer.invoke('suggest', query)
      setSuggestions(data)
    }, 1000)
    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div
      className={
        'absolute z-20 bottom-0 ease-in-out duration-300 left-0 w-72 lg:translate-x-0 h-[calc(100vh-24px)] p-4 flex flex-col bg-gray-800/50 lg:bg-transparent backdrop-blur-lg lg:backdrop-blur-0 ' +
        (hidden ? '-translate-x-full' : 'translate-x-0')
      }
    >
      <h1 className="text-white text-2xl font-semibold">Search</h1>
      <Tooltip id="search" place="top" noArrow opacity={1} offset={2} />

      {hidden ? (
        <button
          onClick={() => setHidden(false)}
          className={'lg:hidden absolute top-1/2 right-0 translate-x-full text-white'}
          data-tooltip-content="Show"
          data-tooltip-id="search"
        >
          <ChevronRight />
        </button>
      ) : (
        <button
          onClick={() => setHidden(true)}
          className="lg:hidden absolute top-1/2 right-0 text-white"
          data-tooltip-content="Hide"
          data-tooltip-id="search"
        >
          <ChevronLeft />
        </button>
      )}
      <div
        className="mt-4 pt-4 w-full flex-1 border-t border-gray-400 relative"
        onKeyDown={(e) => e.key === 'Enter' && search()}
      >
        <div className="w-full relative mb-2">
          <input
            type="text"
            placeholder="Search for a song..."
            className="w-full p-2 pr-10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{
              backgroundColor: hexToRgba(color, 0.3)
            }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Tooltip id="search-input" place="top" noArrow opacity={1} />
          <button
            className="absolute top-0 right-0 h-full px-3 text-[var(--primary)]"
            onClick={search}
            data-tooltip-content="Search"
            data-tooltip-id="search-input"
          >
            <SearchIcon size={20} />
          </button>
        </div>
        {suggestions.length > 0 && (
          <div
            className="absolute top-16 w-64 z-10 flex-col space-y-2 rounded-lg"
            style={{ backgroundColor: hexToRgba(color, 0.5) }}
          >
            {suggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="p-2 cursor-pointer relative"
                onClick={() => {
                  suggestionSearch(suggestion)
                }}
              >
                <p className="text-white">{suggestion}</p>
                <button
                  className="absolute top-0 right-0 text-white p-2 hover:text-[var(--primary)] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setQuery(suggestion)
                  }}
                >
                  <ArrowUp size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
        {suggestions.length === 0 &&
          results.map((song) => (
            <SearchItem
              key={song.videoId}
              song={song}
              active={false}
              play={() => {
                console.log(song.videoId)
                setMusic({
                  name: song.name,
                  artist: song.artist.name,
                  cover: song.thumbnails[0].url,
                  duration: song.duration || 0,
                  id: song.videoId
                })
                setHidden(true)
              }}
              addToList={() => {
                setQueue((prev) => {
                  if (!prev.find((s) => s.id === song.videoId)) {
                    return [
                      ...prev,
                      {
                        name: song.name,
                        artist: song.artist.name,
                        cover: song.thumbnails[0].url,
                        duration: song.duration || 0,
                        id: song.videoId
                      }
                    ]
                  }
                  return prev
                })
              }}
            />
          ))}
      </div>
    </div>
  )
}

const SearchItem = ({
  song,
  active,
  play,
  addToList
}: {
  song: SongDetailed
  active: boolean
  play: () => void
  addToList: () => void
}) => {
  return (
    <div
      className={`flex items-center space-x-4 p-2 rounded-lg cursor-pointer ${
        active ? 'bg-gray-800' : ''
      }`}
    >
      <img src={song.thumbnails[0].url} alt={song.name} className="w-12 h-12 rounded-lg" />
      <div className="flex-1 overflow-hidden">
        <Tooltip id={song.videoId} place="top" noArrow opacity={1} offset={2} />
        <h1
          className="text-white font-semibold truncate"
          data-tooltip-id={song.videoId}
          data-tooltip-content={song.name}
        >
          {song.name}
        </h1>
        <p className="text-gray-300 truncate">{song.artist.name}</p>
      </div>
      <div className="flex items-center space-x-1">
        <Tooltip id={song.videoId + 'play'} place="top" noArrow />
        <button
          className="text-white hover:text-[var(--primary)] transition-colors"
          onClick={play}
          data-tooltip-content="Play"
          data-tooltip-id={song.videoId + 'play'}
        >
          <Play size={20} />
        </button>
        <Tooltip id={song.videoId + 'list'} place="top" noArrow />
        <button
          className="text-white hover:text-[var(--primary)] transition-colors"
          onClick={addToList}
          data-tooltip-content="Add to Queue"
          data-tooltip-id={song.videoId + 'list'}
        >
          <ListVideo size={20} />
        </button>
      </div>
    </div>
  )
}

export default memo(Search)
