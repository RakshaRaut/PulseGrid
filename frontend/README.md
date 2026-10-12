# PulseGrid — IoT Device Monitoring Frontend

A modern, responsive IoT device monitoring dashboard built with **React 19 + Vite**, **Tailwind CSS v4**, and **Recharts**.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle
npm run lint     # oxlint
```

**Demo login:** `demo@pulsegrid.io` / `demo1234` (or register a new account — all client-side).

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
│   ├── auth.jsx                 # mock auth + device fleet state + 5s telemetry tick
│   └── toast.jsx                # toast notification system
├── data/mockDevices.js          # seeded realistic device + telemetry generator
├── pages/                       # route-level screens
└── utils/format.js              # formatting helpers
```

- Navigation (⌘K search, sidebar, notifications) and protected routes are functional.
- Authentication is persistent in `localStorage`; devices are deterministic per session with a live drifting feed.
- All forms validate, show loading states, and surface errors via toasts and inline messages.
- Empty states included everywhere data can be missing.

> Splitting into a real API later: replace `context/auth.jsx` device mutations / mock login with `fetch` calls — the UI layer stays untouched.
