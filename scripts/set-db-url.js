#!/usr/bin/env node
/**
 * Builds DATABASE_URL from raw DB credentials in .env
 * Usage: node scripts/set-db-url.js
 *
 * This reads DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS from .env,
 * URL-encodes them properly, and writes the result as DATABASE_URL back into .env.
 * Run this whenever you change the raw credentials.
 *
 * On Vercel (or any env where .env doesn't exist), it uses process.env directly
 * and sets DATABASE_URL in the environment (no file write needed).
 */
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env')
const envExists = fs.existsSync(envPath)

// Parse variables from .env file (if it exists) or process.env
const vars = {}

if (envExists) {
  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    vars[key] = val
  }
}

// process.env takes precedence over .env file
const host = process.env.DB_HOST || vars.DB_HOST
const port = process.env.DB_PORT || vars.DB_PORT || '3306'
const name = process.env.DB_NAME || vars.DB_NAME
const user = process.env.DB_USER || vars.DB_USER
const pass = process.env.DB_PASS || vars.DB_PASS

if (!host || !name || !user) {
  // No DB creds found — skip silently (e.g., on Vercel during build without DB)
  console.log('No DB credentials found, skipping DATABASE_URL generation.')
  process.exit(0)
}

const enc = (v) => encodeURIComponent(v).replace(/%3A/g, ':')
const url = `mysql://${enc(user)}:${enc(pass)}@${host}:${port}/${name}`

// Set in process.env so prisma generate can pick it up
process.env.DATABASE_URL = url

console.log('Generated DATABASE_URL from raw credentials')

// Only write to .env file if it exists
if (envExists) {
  const content = fs.readFileSync(envPath, 'utf-8')
  const urlLine = `DATABASE_URL=${url}`
  const lines = content.split('\n')
  let found = false
  const newLines = []
  for (const line of lines) {
    if (line.startsWith('DATABASE_URL=')) {
      newLines.push(urlLine)
      found = true
    } else {
      newLines.push(line)
    }
  }
  if (!found) {
    newLines.push(urlLine)
  }
  fs.writeFileSync(envPath, newLines.join('\n'))
}

console.log(`  ${url}`)
