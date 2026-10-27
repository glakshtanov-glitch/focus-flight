// The session timer: a flight is just a start and an end timestamp,
// so it survives reloads, sleep and closed tabs.

import { distanceKm, flightMinutes } from './geo'
import type { Airport, Flight } from './types'

export function startFlight(from: Airport, to: Airport, now = Date.now()): Flight {
  const km = distanceKm(from, to)
  return {
    id: String(now),
    from,
    to,
    distanceKm: Math.round(km),
    startedAt: now,
    endsAt: now + flightMinutes(km) * 60_000,
  }
}

export function remainingMs(flight: Flight, now: number): number {
  return Math.max(0, flight.endsAt - now)
}

// 0 at departure, 1 at landing
export function progress(flight: Flight, now: number): number {
  const fraction = (now - flight.startedAt) / (flight.endsAt - flight.startedAt)
  return Math.min(1, Math.max(0, fraction))
}

export function hasLanded(flight: Flight, now: number): boolean {
  return now >= flight.endsAt
}

// Rounds up, so the countdown shows 0:00 only at landing. 4_330_000 -> "1:12:10", 65_000 -> "1:05"
export function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}
