import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const env = { ...process.env, GITHUB_PAGES: 'true' }

execSync('tsc -b', { stdio: 'inherit' })
execSync('vite build', { stdio: 'inherit', env })
writeFileSync('docs/.nojekyll', '')

console.log('Built for GitHub Pages → docs/')
