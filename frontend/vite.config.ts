import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The dataset lives at the repo root (../data), outside the app. Serve it at
// /data/* during dev; the deploy step copies it into dist/ for production.
const DATA_DIR = path.resolve(fileURLToPath(new URL('../data', import.meta.url)))

function serveData(): Plugin {
  return {
    name: 'serve-root-data',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/data/')) return next()
        const rel = decodeURIComponent(req.url.slice('/data/'.length).split('?')[0])
        const file = path.join(DATA_DIR, rel)
        if (!file.startsWith(DATA_DIR) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next()
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        fs.createReadStream(file).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), serveData()],
})
