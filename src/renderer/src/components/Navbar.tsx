import { Maximize, Minimize, Minus, Music, X } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import hexToRgba from '@renderer/utils/hexToRgba'

const Navbar = ({ title, color }: { title: string; color: string }) => {
  const [maximized, setMaximized] = useState(false)
  const ipcRenderer = window.electron.ipcRenderer
  const handleClick = (action: 'close' | 'minimize' | 'maximize'): void => {
    ipcRenderer.send(action)
  }

  useEffect(() => {
    ipcRenderer.on('maximized', (_, maximized) => {
      setMaximized(maximized)
    })
    return () => {
      ipcRenderer.removeAllListeners('maximized')
    }
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 w-full h-6 flex items-center justify-between px-2 z-50 text-white"
      style={{ backgroundColor: hexToRgba(color, 0.5) }}
    >
      <div className="w-6 h-6">
        <Music className="size-4 mt-1" />
      </div>
      <div
        className="ml-12 mr-2 text-xs font-semibold w-full text-center overflow-hidden whitespace-nowrap"
        id="drag"
      >
        {title}
      </div>

      <div className="flex space-x-2 ml-auto min-w-fit">
        <button
          className="hover:text-[var(--accent)] focus:outline-none"
          onClick={() => handleClick('minimize')}
        >
          <Minus className="size-4" />
        </button>
        <button
          className="hover:text-[var(--accent)] focus:outline-none h-full w-full"
          onClick={() => handleClick('maximize')}
        >
          {maximized ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
        </button>
        <button
          className="hover:text-[var(--accent)] focus:outline-none h-full w-full"
          onClick={() => handleClick('close')}
        >
          <X className="size-4" />
        </button>
      </div>
    </nav>
  )
}

export default memo(Navbar)
