# Music App

A music player app based off with UI based off [Music Player](https://github.com/ItzShubhamDev/music-player/) and [Electron.Js](https://www.electronjs.org/)

## Demo

[Demo Link](https://playerdemo.itzshubhamdev.com)

#### Note: Kasm only allows 5 concurrent sessions, so demo might not work when other people are viewing the demo. You can only play music available in playlist because of Youtube blocking VPNs.

## Features

- Good looking UI
- Landscape and Portrait modes
- Playlists and Queues
- Cross platform
- Good Animations

## Usage

You can simple clone the repo and install the node dependencies

```bash
git clone https://github.com/ItzShubhamDev/music-app
cd music-app
npm install
npm run dev
```

#### Note: Sometimes some songs failed to load, select song from another person in that case, as the issue comes from @distube/ytdl-core

## Building

You can build the application using following commands

```bash
npm run build:win # Windows
npm run build:mac # MacOS
npm run build:linux # Linux Distros
```

## Why?

I love listening music a lot, but many music players have simple design, and many with good design are paid. So I created this to enjoy music and those animations in my free time.

#### Bootstrapped from [ElectronVite](https://electron-vite.org/)

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
