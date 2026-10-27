export interface Airport {
  icao: string
  iata: string
  name: string
  city: string
  country: string
  lat: number
  lon: number
  size: 'large' | 'medium' | 'small'
}

export interface Flight {
  // Start timestamp as a string; unique per flight
  id: string
  from: Airport
  to: Airport
  distanceKm: number
  startedAt: number
  endsAt: number
}

export interface LoggedFlight extends Flight {
  landedAt: number
}
