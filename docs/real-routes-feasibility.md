# Real routes: data source feasibility

Checked on 2026-10-25. The question: can we list the routes flown from an airport recently, for free?

## OpenSky Network (lead candidate)

**Works, but needs a free OpenSky account.** Without one, the flights endpoint refuses: a test query for Warsaw departures returned `403 You cannot access historical flights`.

What an account gives (from the [REST API docs](https://openskynetwork.github.io/opensky-api/rest.html)):

- **Endpoint:** `/flights/departure?airport=EPWA&begin=…&end=…` lists flights that left an airport, each with an estimated arrival airport.
- **Window:** at most two days per query. Data comes from a nightly batch, so it covers yesterday and earlier, not today.
- **Limits:** a standard account gets 4,000 credits a day for flight queries. A one- or two-day query costs 30 credits, so about 130 airport queries a day.
- **Login:** OAuth2 client credentials (a client ID and secret, made on the account page). Tokens last 30 minutes.

What that means for the app:

- **The browser can't call OpenSky directly.** The secret would be visible to anyone opening the page. Instead, a scheduled GitHub Action (free) would query OpenSky, build a `routes.json` file and publish it with the app. The secret stays in the repo's GitHub secrets.
- **Not every airport fits in a day.** About 130 queries a day covers the airports you and your friends actually depart from, refreshed daily. All ~4,000 airports would take a month per cycle.
- **Arrivals are estimated.** OpenSky guesses the arrival airport from where the aircraft's signal ends. On some flights it's missing or wrong, and coverage is thinner where few people run receivers (much of Africa, parts of Asia). Merging a week of departures and only keeping destinations seen at least twice would filter most of the noise.

### Verified with the account (2026-10-25)

Query: Warsaw Chopin (EPWA) departures on 2026-10-24, one day. It cost 30 credits (3,970 left that day).

- **255 departures, 83 distinct destinations.**
- **28 flights (11%) had no arrival airport**, and 8 more were recorded as landing back at Warsaw (training or turned-back flights).
- **Close match with Wikipedia.** Of 78 destinations that map to airports in our dataset, 44 matched the Wikipedia list directly. Most of the rest (LHR, JFK, BCN, FCO, MAD…) are on Wikipedia too but among the names the simple matching missed.
- **Some noise.** A few destinations are small airfields (LQVI, LDZL) or a hop to nearby Modlin (WMI). Keeping only destinations with scheduled service that appear on at least two days of a week would remove them.

## Fallback: Wikipedia "Airlines and destinations" tables

Every airport article on Wikipedia has a table of airlines and the destinations they fly to, kept current by editors and tagged with a source for new routes. It's free to read through Wikipedia's API, with no account.

Tested on Warsaw Chopin: **183 destinations** in the table. 129 matched an airport code using the article links in the airports dataset. The other 54 are airports whose article was renamed since, and they can be matched through Wikidata, which stores each airport's IATA code.

Trade-offs against OpenSky:

- **Pros:** current timetable (including seasonal routes, marked as such), cleaner than estimated arrivals, works for any airport, no account or limits.
- **Cons:** it's a timetable, not proof of flights flown. Smaller airports' tables can be out of date. The text is licensed CC BY-SA 4.0: the app must credit Wikipedia, and a published routes file would carry the same licence. That's fine for a personal app.

## Recommendation

Use **both**, prepared by a script into `public/data/routes.json` so the app doesn't care which source built it:

- **OpenSky** for the airports you actually depart from (Warsaw first): routes really flown in the last week, refreshed daily by a scheduled GitHub Action.
- **Wikipedia** for every other airport, so any departure in the world has destinations.
