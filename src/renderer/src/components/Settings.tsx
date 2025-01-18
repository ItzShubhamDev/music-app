import { Cookie, DatabaseZap, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Settings({
  hidden,
  setHidden
}: {
  hidden: boolean
  setHidden: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const ipcRenderer = window.electron.ipcRenderer
  const [settings, setSettings] = useState<{
    cache: boolean
    cookies: string[]
  }>({
    cache: true,
    cookies: []
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hidden) return
    ipcRenderer.invoke('getSettings').then((settings) => {
      setSettings(settings)
    })
  }, [hidden])

  const update = () => {
    ipcRenderer.invoke('updateSettings', settings)
    setHidden(true)
  }

  const handleCookies = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value === '') {
      setSettings({ ...settings, cookies: [] })
      return setError(null)
    }
    try {
      const cookies = JSON.parse(e.target.value)
      if (!Array.isArray(cookies)) {
        setSettings({ ...settings, cookies: [] })
        return setError('Invalid Array')
      }
      setSettings({ ...settings, cookies })
      setError(null)
    } catch {
      setSettings({ ...settings, cookies: [] })
      setError('Invalid JSON')
    }
  }

  return (
    <div
      className={
        'fixed w-full sm:w-80 bottom-0 z-40 transition-transform duration-300 ' +
        `${hidden ? '-translate-y-full h-screen' : 'translate-y-0 h-[calc(100vh-24px)] '}`
      }
    >
      <div className="relative bg-gray-800 px-4 text-white w-full h-full flex flex-col items-center justify-center">
        <div className="absolute top-0 flex w-full justify-between text-xl font-medium p-2">
          <span>Settings</span>
          <button onClick={() => setHidden(!hidden)}>
            <X />
          </button>
        </div>
        <div className="flex w-full justify-between items-center">
          <div className="text-left text-md flex items-center">
            <span>Cache</span>
            <DatabaseZap className="ml-2 size-4" />
            <span className="ml-2 text-sm">For faster loading times</span>
          </div>
          <input
            type="checkbox"
            checked={settings.cache}
            className="accent-gray-700"
            onChange={(e) => setSettings({ ...settings, cache: e.target.checked })}
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center">
            <span>Cookies</span>
            <Cookie className="ml-2 size-4" />
            <span className="ml-2 text-sm">Youtube cookies for downloading songs</span>
          </div>
          <textarea
            value={JSON.stringify(settings.cookies, null, 2)}
            onChange={handleCookies}
            className="rounded h-64 focus:outline-none bg-gray-700 focus:ring-2 p-2 mt-2"
          />
          <span className="text-xs font-medium mt-1">
            * Paste your cookies here in JSON format only
          </span>
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
        <button
          className="bg-gray-700 text-white hover:bg-gray-600 py-1 rounded mt-2 w-full"
          onClick={update}
        >
          Save
        </button>
      </div>
    </div>
  )
}
