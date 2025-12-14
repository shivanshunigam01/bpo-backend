# Zentroverse Telecalling Backend (Plain)

Simple structure: controllers, models, routes, middlewares, helpers, config.

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

## Endpoints
- Auth: /api/auth/register, /api/auth/login, /api/auth/me
- Leads: /api/leads (CRUD), /api/leads/import/file, /api/leads/export/file
- Calls: /api/calls/start, /api/calls/hangup, /api/calls/status/:callId

SMARTFLO_MODE=mock simulates calling so you can test UI end-to-end.
