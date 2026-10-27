// Browser storage on this device. Every access is guarded: storage can be
// blocked or cleared (private windows), and the app must still work without it.

import type { Airport, Flight, LoggedFlight } from './types'

const PREFIX = 'focus-flight:'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) localStorage.removeItem(PREFIX + key)
    else localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Not saved; the session itself carries on
  }
}

export const getLastDeparture = () => read<Airport | null>('lastDeparture', null)
export const setLastDeparture = (airport: Airport) => write('lastDeparture', airport)

export const getActiveFlight = () => read<Flight | null>('activeFlight', null)
export const setActiveFlight = (flight: Flight | null) => write('activeFlight', flight)

// Newest first
export const getLog = () => read<LoggedFlight[]>('log', [])

export function addToLog(flight: LoggedFlight): void {
  const log = getLog()
  if (log.some((f) => f.id === flight.id)) return
  write('log', [flight, ...log])
}
