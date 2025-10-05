# CourseCompass Community API

Node.js backend for the CourseCompass community dashboard. Provides REST and WebSocket services for course threads, comments, activity, and trending insights.

## Quick Start

```bash
cp .env.example .env
npm install
npm run seed   # optional demo data
npm run dev    # start with nodemon
```

The server exposes REST endpoints under `/api` and Socket.IO events on the same host.

- REST base: `http://localhost:8080`
- WebSocket: `ws://localhost:8080`

Refer to `src/seed/demo-data.json` for sample seed content.
