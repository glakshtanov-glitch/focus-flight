// Downloads the OurAirports dataset (public domain) and writes the airports
// with scheduled passenger service to public/data/airports.json.
// Run with: npm run data:airports

import { writeFile } from 'node:fs/promises'

const SOURCE = 'https://davidmegginson.github.io/ourairports-data/airports.csv'
const OUTPUT = new URL('../public/data/airports.json', import.meta.url)
const KEPT_TYPES = new Set(['large_airport', 'medium_airport', 'small_airport'])

// Minimal CSV parser: handles quoted fields, escaped quotes and commas inside quotes
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') {
        quoted = false
      } else {
        field += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const response = await fetch(SOURCE)
if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`)
const [header, ...rows] = parseCsv(await response.text())
const col = Object.fromEntries(header.map((name, i) => [name, i]))

const airports = rows
  .filter(
    (r) =>
      r[col.scheduled_service] === 'yes' &&
      KEPT_TYPES.has(r[col.type]) &&
      r[col.iata_code],
  )
  .map((r) => ({
    icao: r[col.icao_code] || r[col.gps_code] || r[col.ident],
    iata: r[col.iata_code],
    name: r[col.name],
    city: r[col.municipality],
    country: r[col.iso_country],
    lat: Number(Number(r[col.latitude_deg]).toFixed(4)),
    lon: Number(Number(r[col.longitude_deg]).toFixed(4)),
    size: r[col.type].replace('_airport', ''),
  }))
  .sort((a, b) => a.iata.localeCompare(b.iata))

await writeFile(OUTPUT, JSON.stringify(airports))
console.log(`${rows.length} rows downloaded, ${airports.length} airports kept`)
