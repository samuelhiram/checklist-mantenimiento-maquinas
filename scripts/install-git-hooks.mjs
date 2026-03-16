import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const rootDir = process.cwd()
const gitDir = path.join(rootDir, '.git')
const hooksDir = path.join(rootDir, '.githooks')
const hookFiles = ['pre-commit', 'pre-push']

if (!fs.existsSync(gitDir)) {
  console.info('[hooks] No .git directory found. Hook files were left in .githooks for future activation.')
  process.exit(0)
}

for (const hookFile of hookFiles) {
  const hookPath = path.join(hooksDir, hookFile)
  if (fs.existsSync(hookPath)) {
    fs.chmodSync(hookPath, 0o755)
  }
}

const result = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.info('[hooks] Git hooks configured to use .githooks')
