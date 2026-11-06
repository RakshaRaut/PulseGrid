# PulseGrid — IoT Device Monitoring Frontend

A modern, responsive IoT device monitoring dashboard built with **React 19 + Vite**, **Tailwind CSS v4**, and **Recharts**.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle
npm run lint     # oxlint
```

The frontend calls `/api` by default. Vite proxies that path to the local
backend during development, and the production Nginx gateway routes it to the
backend service. Set `VITE_API_URL` only when the API is hosted elsewhere.

## Pages

| Route | Description |
|---|---|
| `/login` | Email/password sign-in with validation and demo hint |
| `/register` | Name/email/password with strength meter |
| `/dashboard` | Fleet KPIs, live sensor cards, status pie chart, recent activity, low-battery & offline alerts |
| `/devices` | Search, status/type/location filters, sorting, grid/table toggle, add-device modal, delete with confirm |
| `/devices/:id` | Real-time telemetry cards, temp/humidity area chart, battery trend bar + gauge, attributes, status history |

## Architecture

```
src/
├── components/
│   ├── auth/AuthLayout.jsx      # split-screen auth shell
│   ├── charts/deviceCharts.jsx  # Recharts: area, bar, radial gauge
│   ├── dashboard/               # dashboard page container
│   ├── layout/Layout.jsx        # app shell: sidebar, topbar, ⌘K search, notifications
│   └── ui/                      # cards, forms, badges (design-system primitives)
├── context/
│   ├── auth.jsx                 # API authentication and device fleet state
│   └── toast.jsx                # toast notification system
├── services/telemetryService.js # backend device and telemetry integration
├── pages/                       # route-level screens
└── utils/format.js              # formatting helpers
```

- Navigation (⌘K search, sidebar, notifications) and protected routes are functional.
- Authentication uses the backend JWT API; the token and session are persisted in `localStorage`.
- Device CRUD is scoped to the authenticated user and persisted by the backend. Telemetry presentation is generated from returned device metadata until live telemetry endpoints are available.
- Live telemetry is polled from `/api/devices/telemetry` every five seconds. Configure the backend with ThingsBoard credentials (`TB_USERNAME`/`TB_PASSWORD` or `TB_JWT_TOKEN`); the ThingsBoard keys are controlled by `TB_TELEMETRY_KEYS`. Devices are created and linked by the backend.
- On every device refresh, the backend discovers tenant devices from ThingsBoard and synchronizes them into the logged-in user's PulseGrid device list. For local backend development, use `TB_BASE_URL=http://localhost:18080`; inside Docker, use `http://thingsboard:8080`.
- All forms validate, show loading states, and surface errors via toasts and inline messages.
- Empty states included everywhere data can be missing.

