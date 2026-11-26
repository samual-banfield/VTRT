# Victorian Transport Reliability Tracker

> How late is Victorian public transport, really? Live delay tracking for every trip, with the history to prove it.

<!-- TODO -->
<!-- **Live demo:** <https://domain.com> · -->

---

## Why this exists

Moving to Melbourne has given me a newfound appreciation for public transport and how lucky we are to have access to affordable accessible public transport. That doesn't mean that we as a state can't do better.

If you were travelling along the Sunbury corridor during the construction and opening of the recent metro tunnel you likely would have experienced several back to back weeknds and some weeks of complete bus replacements.

At present, the only form of officially published transit performance statistics is a [summary](https://opendata.transport.vic.gov.au/dataset/public-transport-operational-performance) provided by the Victorian Government. The public has no way to see the performance of individual trips, a clear way of identifying the impact of specific transport works, or the performance of specific regions or transit types to see what parts of the network need the most attention.

I want to develop a website with the comedic appeal of https://howmanydayssincemontaguestreetbridgehasbeenhit.com/ that gives the public a holistic view of our transit network.

<!-- TODO -->
<!--  ## Key findings -->

## Features

- Ingests GTFS Realtime (trip updates, vehicle positions, alerts) every 30s
- Deduplicates and normalises updates into one record per trip stop, with consistent delay metrics
- Tracks static GTFS schedule versions so historic delays are compared against the _correct_ timetable
- REST API for delay stats by region, mode, route and time window.
- React frontend with different summary / detail views.

## Architecture

<!--
TODO
![Architecture diagram](docs/images/architecture.png)
-->

| Component         | Tech                    | Responsibility                                                   |
| ----------------- | ----------------------- | ---------------------------------------------------------------- |
| Frontend          | S3 + CloudFront + React | Static site, served over HTTPS                                   |
| REST API          | FastAPI in Docker       | Serves aggregated delay data under `/api/*`                      |
| Realtime ingester | Docker, runs every 30s  | Pulls realtime data, deduplicates, and writes to DB              |
| Schedule loader   | Docker, runs hourly     | Checks for a new static GTFS version, and writes to DB           |
| Database          | RDS + MySQL             | Contains a table for Schedule history and Historic realtime data |

### Data flow

1. Every 30 seconds the realtime ingester fetches realtime GTFS information and decodes the protobuf
2. Each stop update is updated or inserted as a temporary record, so duplicate or repeated updates collapse into one current prediction.
3. Once a stop's scheduled time plus a grace period has passed, its last prediction is finalised and written as a permanent delay record.
4. Hourly, the schedule loader checks for a new static GTFS version. Each version is stored with a timestamp so trips are always compared against the timetable that applied at the time.
5. The API then reads these finalised records.

<!-- TODO
### Design decisions

- **Why EC2 + Docker instead of Lambda/ECS?** (cost, simplicity, 30 s polling cadence)
- **How "delay" is defined**
- **How schedule versions are handled**
- **How arrival times are handled**
-->

## Data sources

| Source                                                                                                      | Used for                  | Licence                          |
| ----------------------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------- |
| [Transport Victoria Open Data — GTFS Realtime](https://opendata.transport.vic.gov.au/dataset/gtfs-realtime) | Live trip updates         | Creative Commons Attribution 4.0 |
| [Transport Victoria Open Data — GTFS Schedule](https://opendata.transport.vic.gov.au/dataset/gtfs-schedule) | Timetables, stops, routes | Creative Commons Attribution 4.0 |

<!--
TODO
## Data model

Include a small ERD or table list: `stops`, `routes`, `trips`, `stop_times`, `schedule_versions`, `delay_events`, `region_daily_stats`.
-->

## Getting started

### Prerequisites

- Docker + Docker Compose
- A Transport Victoria Open Data API key ([link to sign-up](https://opendata.transport.vic.gov.au/))

### Run locally

```bash
git clone https://github.com/samual-banfield/VTRT.git
cd VTRT
cp .env.example .env        # add your API key
docker compose up --build
```

- API: http://localhost:5173
- Docs: http://localhost:5173/docs

### Configuration

| Variable       | Description       | Default |
| -------------- | ----------------- | ------- |
| `PTV_API_KEY`  | Open Data API key | —       |
| `DATABASE_URL` | RDS Address       | —       |

## API

<!-- TODO: Finalise and document endpoints  -->

| Endpoint                      | Description             |
| ----------------------------- | ----------------------- |
| `GET /api/routes/{id}/delays` | Delay stats for a route |

<!-- TODO
## Deployment
Infrastructure is defined with Cloudformations docs
CI/CD via GitHub Actions: github containers(?) →
Health checks alarms (e.g. alert when no realtime rows written in 5 min)
**Estimated monthly cost:** ~$XX (EC2 <type>, RDS <type>, CloudFront, S3).
-->

## Roadmap

- [ ] CICD / Deployment and IaC
- [ ] Disruption analysis by corridor and track segment
- [ ] Delays vs. weather and planned works analysis

## Acknowledgements and licence

Contains data from Transport Victoria / Public Transport Victoria, used under Creative Commons Attribution 4.0.
Code licensed under MIT — see [LICENSE](LICENSE).
