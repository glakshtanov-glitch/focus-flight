<script lang="ts">
  import type { AirportSearch } from './airports'
  import type { Airport } from './types'

  interface Props {
    search: AirportSearch
    placeholder: string
    exclude?: string
    // Extra text on each result, such as the flight time
    detail?: (airport: Airport) => string
    onselect: (airport: Airport) => void
  }

  let { search, placeholder, exclude, detail, onselect }: Props = $props()

  let query = $state('')
  let results = $derived(search(query, { exclude }))

  function onkeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && results.length > 0) onselect(results[0])
  }
</script>

<input type="search" bind:value={query} {placeholder} {onkeydown} autocomplete="off" />

<ul>
  {#each results as airport (airport.icao)}
    <li>
      <button type="button" onclick={() => onselect(airport)}>
        <strong>{airport.iata}</strong>
        {airport.name}, {airport.city}, {airport.country}
        {#if detail}<span class="detail">{detail(airport)}</span>{/if}
      </button>
    </li>
  {/each}
</ul>

<style>
  input {
    width: 100%;
    padding: 0.6rem;
    font: inherit;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  button {
    width: 100%;
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    text-align: left;
    font: inherit;
    background: none;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }

  .detail {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
  }
</style>
