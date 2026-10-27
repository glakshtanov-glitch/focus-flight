import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createSearch, normalize } from './airports'
import { formatCountdown, hasLanded, progress, remainingMs, startFlight } from './flight'
import { distanceKm, flightMinutes, formatDuration } from './geo'
import type { Airport } from './types'

const airports: Airport[] = JSON.parse(
  readFileSync(new URL('../../public/data/airports.json', import.meta.url), 'utf-8'),
)
const byIata = (code: string) => airports.find((a) => a.iata === code)!
const search = createSearch(airports)

describe('flight times', () => {
  it('matches the examples in docs/flight-time.md', () => {
    const waw = byIata('WAW')
    expect(Math.round(distanceKm(waw, byIata('LHR')))).toBe(1469)
    expect(formatDuration(flightMinutes(distanceKm(waw, byIata('LHR')), 830))).toBe('2:16')
    expect(formatDuration(flightMinutes(distanceKm(waw, byIata('JFK')), 900))).toBe('8:07')
  })

  it('uses the reference speed by default', () => {
    expect(flightMinutes(840)).toBe(90)
  })
})

describe('airport search', () => {
  it('finds codes first', () => {
    expect(search('waw')[0].iata).toBe('WAW')
    expect(search('EPKK')[0].iata).toBe('KRK')
  })

  it('ignores accents and special letters', () => {
    expect(normalize('Łódź Kraków')).toBe('lodz krakow')
    expect(search('krakow').map((a) => a.iata)).toContain('KRK')
  })

  it('finds Warsaw airports by city and by name', () => {
    const codes = search('warsaw').map((a) => a.iata)
    expect(codes[0]).toBe('WAW')
    expect(codes).toContain('WMI')
  })

  it('leaves out the excluded airport and empty queries', () => {
    expect(search('waw', { exclude: 'EPWA' }).map((a) => a.iata)).not.toContain('WAW')
    expect(search('  ')).toEqual([])
  })
})

describe('timer', () => {
  const start = 1_000_000
  const flight = startFlight(byIata('WAW'), byIata('KRK'), start)
  const length = flight.endsAt - flight.startedAt

  it('runs from start and end timestamps', () => {
    expect(length).toBe(flightMinutes(distanceKm(byIata('WAW'), byIata('KRK'))) * 60_000)
    expect(remainingMs(flight, start + 60_000)).toBe(length - 60_000)
    expect(progress(flight, start + length / 2)).toBe(0.5)
  })

  it('lands at the end and never goes below zero', () => {
    expect(hasLanded(flight, flight.endsAt - 1)).toBe(false)
    expect(hasLanded(flight, flight.endsAt)).toBe(true)
    expect(remainingMs(flight, flight.endsAt + 5000)).toBe(0)
    expect(progress(flight, flight.endsAt + 5000)).toBe(1)
  })

  it('formats the countdown', () => {
    expect(formatCountdown(4_330_000)).toBe('1:12:10')
    expect(formatCountdown(65_000)).toBe('1:05')
    expect(formatCountdown(400)).toBe('0:01')
    expect(formatCountdown(0)).toBe('0:00')
  })
})
