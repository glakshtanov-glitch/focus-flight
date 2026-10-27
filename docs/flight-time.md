# Flight-time formula

Flight times in Focus Flight are computed, not taken from timetables.

## Formula

```
flight time (min) = distance (km) / cruise speed (km/h) × 60 + 30
```

- **Distance** is the great-circle distance between the two airports, using the haversine formula with an Earth radius of 6371 km and the coordinates in `public/data/airports.json`.
- **Cruise speed** is the aircraft's cruise speed from the aircraft CSV, in km/h.
- **30 minutes** is a fixed allowance for the parts of the flight not flown at cruise speed: about 10 min taxi out, 15 min extra for climb and descent, 5 min taxi in.

The result is rounded to the nearest minute.

## Examples from Warsaw (WAW)

| To | Distance | Cruise speed | Flight time |
| --- | --- | --- | --- |
| Kraków (KRK) | 246 km | 780 km/h | 0:48 |
| London Heathrow (LHR) | 1469 km | 830 km/h | 2:16 |
| Barcelona (BCN) | 1870 km | 830 km/h | 2:45 |
| Dubai (DXB) | 4156 km | 900 km/h | 5:07 |
| New York JFK (JFK) | 6848 km | 900 km/h | 8:06 |
| Tokyo Narita (NRT) | 8613 km | 900 km/h | 10:04 |

These come out roughly 10–15% shorter than airline timetables, which add padding for winds, air-traffic queues and holding. The timer only needs the numbers to be consistent with each other, so the formula stays simple. If they should feel closer to the timetable, raise the allowance or multiply the distance by about 1.1.

## Reference speed for the globe

In real-routes mode the globe shows destinations (step 3) before the aircraft is chosen (step 4), so the times on the globe can't use the chosen aircraft's speed. They use a **reference speed of 840 km/h**, a typical jet airliner.

Once the aircraft is chosen, its own speed would give a slightly different time. The session length doesn't change: the in-flight event (tailwind, holding pattern and so on) absorbs the difference, the same way it closes the gap to the chosen time.

## Custom-routes mode

Decided 2026-10-27: the time shown under each airport code on the globe is the final session length. It always uses the reference speed, so choosing an aircraft never changes how long the session lasts.
