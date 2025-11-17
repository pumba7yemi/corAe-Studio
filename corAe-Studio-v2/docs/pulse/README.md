# corAe Pulse Engine™ (MVP)

Measures three signals:
- **Time Saved** (min) — automation minutes, 0..1440
- **Flow Rating** (0..100) — mix of routine adherence and task completion
- **Purpose Index** (0..100) — alignment of declared tags with values

Adapter: in-memory (swap to DB later). API routes expose `POST /api/pulse/ingest` and `GET /api/pulse/summary`.
