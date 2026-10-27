<script lang="ts">
  import { onMount } from 'svelte'
  import AirportSearch from './lib/AirportSearch.svelte'
  import FlightLog from './lib/FlightLog.svelte'
  import FlightScreen from './lib/FlightScreen.svelte'
  import { createSearch, loadAirports, type AirportSearch as Search } from './lib/airports'
  import { hasLanded, startFlight } from './lib/flight'
  import { distanceKm, flightMinutes, formatDuration } from './lib/geo'
  import {
    addToLog,
    getActiveFlight,
    getLastDeparture,
    getLog,
    setActiveFlight,
    setLastDeparture,
  } from './lib/storage'
  import type { Airport, Flight, LoggedFlight } from './lib/types'

  type Screen = 'loading' | 'departure' | 'destination' | 'flight' | 'landed' | 'log' | 'error'

  let screen = $state<Screen>('loading')
  let search = $state.raw<Search | null>(null)
  let departure = $state.raw<Airport | null>(getLastDeparture())
  let flight = $state.raw<Flight | null>(getActiveFlight())
  let landed = $state.raw<LoggedFlight | null>(null)
  let log = $state.raw<LoggedFlight[]>(getLog())

  onMount(async () => {
    // A flight in progress picks up where it was, even after a reload
    if (flight) {
      if (hasLanded(flight, Date.now())) land()
      else screen = 'flight'
    }
    try {
      search = createSearch(await loadAirports())
      if (screen === 'loading') screen = 'departure'
    } catch {
      if (screen === 'loading') screen = 'error'
    }
  })

  function chooseDeparture(airport: Airport) {
    departure = airport
    setLastDeparture(airport)
    screen = 'destination'
  }

  function depart(to: Airport) {
    if (!departure) return
    flight = startFlight(departure, to)
    setActiveFlight(flight)
    screen = 'flight'
  }

  function land() {
    if (!flight) return
    // Landed at the scheduled time, even if the tab was closed then
    const entry: LoggedFlight = { ...flight, landedAt: flight.endsAt }
    addToLog(entry)
    log = getLog()
    landed = entry
    flight = null
    setActiveFlight(null)
    screen = 'landed'
  }

  function cancel() {
    flight = null
    setActiveFlight(null)
    screen = 'departure'
  }

  const timeTo = (to: Airport) => (departure ? formatDuration(flightMinutes(distanceKm(departure, to))) : '')
</script>

<main>
  {#if screen === 'loading'}
    <p>Loading airports…</p>
  {:else if screen === 'error'}
    <p>The airports list didn't load. Check the connection and reload the page.</p>
  {:else if screen === 'departure' && search}
    <h2>Departure airport</h2>
    {#if departure}
      <button type="button" onclick={() => chooseDeparture(departure!)}>
        Depart from {departure.iata} · {departure.name}
      </button>
      <p>or search for another:</p>
    {/if}
    <AirportSearch {search} placeholder="City, airport or code" onselect={chooseDeparture} />
  {:else if screen === 'destination' && search && departure}
    <h2>From {departure.iata}, fly to…</h2>
    <!-- Stand-in for the globe: search any destination and see its flight time -->
    <AirportSearch
      {search}
      placeholder="City, airport or code"
      exclude={departure.icao}
      detail={timeTo}
      onselect={depart}
    />
    <button type="button" onclick={() => (screen = 'departure')}>Back</button>
  {:else if screen === 'flight' && flight}
    <FlightScreen {flight} onland={land} oncancel={cancel} />
  {:else if screen === 'landed' && landed}
    <h2>Landed in {landed.to.city}</h2>
    <p>
      {landed.from.iata} → {landed.to.iata} ·
      {formatDuration(Math.round((landed.endsAt - landed.startedAt) / 60_000))} ·
      {landed.distanceKm.toLocaleString()} km. Saved to your flight log.
    </p>
    <button type="button" onclick={() => (screen = 'departure')}>New flight</button>
    <button type="button" onclick={() => (screen = 'log')}>Flight log</button>
  {:else if screen === 'log'}
    <h2>Flight log</h2>
    <FlightLog {log} />
    <button type="button" onclick={() => (screen = 'departure')}>New flight</button>
  {/if}

  {#if screen === 'departure' || screen === 'destination'}
    <button type="button" class="log-link" onclick={() => (screen = 'log')}>Flight log ({log.length})</button>
  {/if}
</main>

<style>
  main {
    max-width: 640px;
    margin: 0 auto;
    padding: 2rem 16px;
  }

  button {
    margin: 0.5rem 0.5rem 0.5rem 0;
    padding: 0.5rem 0.8rem;
    font: inherit;
    cursor: pointer;
  }

  .log-link {
    display: block;
    margin-top: 2rem;
  }
</style>
