#!/usr/bin/env node
/**
 * Builds DATABASE_URL from raw DB credentials in .env
 * Usage: node scripts/set-db-url.js
 * 
 * This reads DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS from .env,
 * URL-encodes them properly, and writes the result as DATABASE_URL back into .env.
 * Run this whenever you change the raw credentials.
 */
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env')
const content = fs.readFileSync(envPath, 'utf-8')

// Parse .env manually (handles no quotes, single quotes, double quotes)
const vars = {}
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

const host = vars.DB_HOST
const port = vars.DB_PORT || '3306'
const name = vars.DB_NAME
const user = vars.DB_USER
const pass = vars.DB_PASS

if (!host || !name || !user) {
  console.error('Missing DB_HOST, DB_NAME or DB_USER in .env')
  process.exit(1)
}

const enc = (v) => encodeURIComponent(v).replace(/%3A/g, ':')
const url = `mysql://${enc(user)}:${enc(pass)}@${host}:${port}/${name}`

console.log('Generated DATABASE_URL from raw credentials')

// Replace or append DATABASE_URL in .env
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
console.log(`  ${url}`)
