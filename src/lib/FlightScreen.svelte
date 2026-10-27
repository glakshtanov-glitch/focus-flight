<script lang="ts">
  import { formatCountdown, hasLanded, progress, remainingMs } from './flight'
  import type { Flight } from './types'

  interface Props {
    flight: Flight
    onland: () => void
    oncancel: () => void
  }

  let { flight, onland, oncancel }: Props = $props()

  let now = $state(Date.now())
  let cancelArmed = $state(false)

  $effect(() => {
    const timer = setInterval(() => (now = Date.now()), 250)
    return () => clearInterval(timer)
  })

  $effect(() => {
    if (hasLanded(flight, now)) onland()
  })
</script>

<section>
  <p>{flight.from.iata} → {flight.to.iata} · {flight.to.city}</p>
  <h1>{formatCountdown(remainingMs(flight, now))}</h1>
  <progress value={progress(flight, now)}></progress>

  {#if cancelArmed}
    <button type="button" onclick={oncancel}>Yes, cancel (not logged)</button>
    <button type="button" onclick={() => (cancelArmed = false)}>Keep flying</button>
  {:else}
    <button type="button" onclick={() => (cancelArmed = true)}>Cancel flight</button>
  {/if}
</section>

<style>
  h1 {
    font-size: 4rem;
    font-weight: 200;
    font-variant-numeric: tabular-nums;
    margin: 0.5rem 0;
  }

  progress {
    width: 100%;
  }
</style>
