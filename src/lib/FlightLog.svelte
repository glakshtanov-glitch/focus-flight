<script lang="ts">
  import { formatDuration } from './geo'
  import type { LoggedFlight } from './types'

  let { log }: { log: LoggedFlight[] } = $props()

  const minutes = (f: LoggedFlight) => Math.round((f.endsAt - f.startedAt) / 60_000)

  const date = (timestamp: number) =>
    new Date(timestamp).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
</script>

{#if log.length === 0}
  <p>No flights yet.</p>
{:else}
  <table>
    <thead>
      <tr><th>Departed</th><th>Route</th><th>Time</th><th>Distance</th></tr>
    </thead>
    <tbody>
      {#each log as f (f.id)}
        <tr>
          <td>{date(f.startedAt)}</td>
          <td>{f.from.iata} → {f.to.iata} ({f.to.city})</td>
          <td>{formatDuration(minutes(f))}</td>
          <td>{f.distanceKm.toLocaleString()} km</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    text-align: left;
    padding: 0.4rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
</style>
