import { Music } from '../types'
import { ChevronLeft, ChevronRight, ListPlus, Play, Trash } from 'lucide-react'
import Queue from './Queue'
import { memo, useState } from 'react'
import { Tooltip } from 'react-tooltip'
import hexToRgba from '@renderer/utils/hexToRgba'

const Playlist = ({
  music,
  setMusic,
  queue,
  setQueue,
  setHistory,
  playlist,
  setPlaylist,
  color
}: {
  music: Music | null
  setMusic: React.Dispatch<React.SetStateAction<Music | null>>
  queue: Music[]
  setHistory: React.Dispatch<React.SetStateAction<Music[]>>
  playlist: Music[]
  setQueue: React.Dispatch<React.SetStateAction<Music[]>>
  setPlaylist: React.Dispatch<React.SetStateAction<Music[]>>
  color: string
}) => {
  const [hidden, setHidden] = useState(true)
  const updateQueue = (song: Music | Music[]) => {
    if (Array.isArray(song)) {
      const queue = song.filter((s) => s.id != music?.id)
      setQueue([...queue])
    } else {
      setQueue([...queue, song])
    }
  }
  const addToPlaylist = (song: Music) => {
    if (playlist.some((s) => s.id === song.id)) return
    setPlaylist([...playlist, song])
  }
  return (
    <div
      className={
        'absolute z-20 bottom-0 ease-in-out duration-300 right-0 w-72 lg:translate-x-0 h-[calc(100vh-24px)] flex flex-col bg-gray-800/50 lg:bg-transparent backdrop-blur-lg lg:backdrop-blur-0 ' +
        (hidden ? 'translate-x-full' : 'translate-x-0')
      }
    >
      <Queue
        music={music}
        setMusic={setMusic}
        queue={queue}
        playlist={playlist}
        setQueue={setQueue}
        setHistory={setHistory}
        addToPlaylist={addToPlaylist}
        color={color}
      />
      <Tooltip id="playlist" place="top" noArrow opacity={1} offset={2} />

      {hidden ? (
        <button
          onClick={() => setHidden(false)}
          className="lg:hidden absolute top-1/2 -left-12 translate-x-full text-white "
          data-tooltip-content="Hide"
          data-tooltip-id="playlist"
        >
          <ChevronLeft />
        </button>
      ) : (
        <button
          onClick={() => setHidden(true)}
          className="lg:hidden absolute top-1/2 -left-6 translate-x-full text-white "
          data-tooltip-content="Show"
          data-tooltip-id="playlist"
        >
          <ChevronRight />
        </button>
      )}
      <div className="w-full h-1/2 p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-2xl font-semibold">Playlist</h1>
          <button
            className="text-white bg-[var(--primary)] hover:text-[var(--accent)] transition-colors p-2 rounded-lg"
            onClick={() => updateQueue(playlist)}
          >
            <Play size={24} />
          </button>
        </div>
        <div className="mt-4 pt-4 w-full flex-1 border-t border-gray-400 overflow-y-scroll">
          {playlist.map((song) => (
            <PlaylistItem
              key={song.id}
              music={song}
              active={music?.id === song.id}
              onClick={() => setMusic(song)}
              onPlaylistAdd={() => {
                updateQueue(song)
              }}
              onDelete={() => {
                setPlaylist((prev) => prev.filter((s) => s.id !== song.id))
              }}
              color={color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const PlaylistItem = ({
  music,
  active,
  onClick,
  onPlaylistAdd,
  onDelete,
  color
}: {
  music: Music
  active: boolean
  onClick: () => void
  onPlaylistAdd: () => void
  onDelete: () => void
  color: string
}) => {
  return (
    <div
      className="w-full flex items-center space-x-2 p-2 rounded-lg cursor-pointer"
      style={
        active
          ? {
              backgroundColor: hexToRgba(color, 0.5)
            }
          : {}
      }
      onClick={onClick}
    >
      <img src={music.cover} alt={music.name} className="w-12 h-12 rounded-lg" />
      <div className="flex-1 overflow-hidden">
        <Tooltip id={music.id} place="top" noArrow opacity={1} offset={2} />
        <h1
          className="text-white font-semibold truncate"
          data-tooltip-id={music.id}
          data-tooltip-content={music.name}
        >
          {music.name}
        </h1>
        <p className="text-gray-300 truncate">{music.artist}</p>
      </div>
      <Tooltip id={music.id + 'add'} place="top" noArrow opacity={1} offset={2} />
      <button
        className="text-white hover:text-[var(--primary)] transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          onPlaylistAdd()
        }}
        data-tooltip-content="Add to Queue"
        data-tooltip-id={music.id + 'add'}
      >
        <ListPlus size={20} />
      </button>
      <Tooltip id={music.id + 'deleteP'} place="top" noArrow opacity={1} offset={2} />
      <button
        className="text-white hover:text-red-500 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        data-tooltip-content="Delete"
        data-tooltip-id={music.id + 'deleteP'}
      >
        <Trash size={20} />
      </button>
    </div>
  )
}

export default memo(Playlist)
