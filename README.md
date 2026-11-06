# PulseGrid

PulseGrid is an IoT monitoring platform for registering devices, collecting telemetry, and monitoring sensor data. It combines a React frontend, a NestJS backend, PostgreSQL, ThingsBoard, and MQTT-based IoT simulators in a Docker Compose environment.

> **Project status:** The main services are running, device creation is integrated with ThingsBoard, and the IoT simulators publish changing telemetry at 5-second intervals.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Docker Compose Services](#docker-compose-services)
- [Useful Commands](#useful-commands)
- [Device and Telemetry Flow](#device-and-telemetry-flow)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)

## Features

- User registration and login through the PulseGrid application.
- JWT-based authentication for protected backend endpoints.
- Device management through the frontend and backend.
- Device creation in ThingsBoard through its REST API.
- PostgreSQL persistence using Prisma.
- IoT simulator services that publish telemetry over MQTT.
- ThingsBoard integration for device and telemetry management.
- Docker Compose-based local development and service management.
- Telemetry values such as temperature, humidity, and battery level.
- Simulator telemetry updates at a 5-second interval.

## Architecture

```text
                     ┌─────────────────────┐
                     │   React Frontend   │
                     │   (Web Interface)  │
                     └──────────┬──────────┘
                                │ PulseGrid API
                                ▼
                     ┌─────────────────────┐
                     │    NestJS Backend  │
                     │ Controllers/Services│
                     └──────┬────────┬─────┘
                            │        │
                  Prisma    │        │ ThingsBoard REST API
                            ▼        ▼
                  ┌────────────┐  ┌─────────────────┐
                  │ PostgreSQL│  │   ThingsBoard   │
                  │  Database │  │ Devices/Tenant  │
                  └────────────┘  └────────┬────────┘
                                          ▲
                                          │ MQTT telemetry
                               ┌──────────┴──────────┐
                               │   IoT Simulators   │
                               │  Simulator 1 & 2   │
                               └─────────────────────┘
```

### Authentication boundaries

- **Frontend → PulseGrid backend:** PulseGrid application JWT.
- **Backend → ThingsBoard:** ThingsBoard server-side authentication.
- **Simulator → ThingsBoard MQTT:** Device access token.

ThingsBoard credentials and privileged tokens must remain on the backend or in secure simulator configuration—not in frontend code.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | NestJS, Node.js |
| Database | PostgreSQL |
| ORM | Prisma |
| IoT platform | ThingsBoard |
| Device communication | MQTT |
| API communication | REST |
| Containerization | Docker, Docker Compose |

## Prerequisites

Install the following before running PulseGrid:

- Docker Engine
- Docker Compose plugin (`docker compose`)
- Git
- A web browser

For running individual services outside Docker, also install the Node.js version required by the project's package files and npm.

## Getting Started

### 1. Clone the repository

```bash
git clone <REPOSITORY_URL>
cd pulseGrid
```

### 2. Configure environment variables

Create or update the environment files required by the project. Check the existing environment examples and Compose configuration before creating new variables.

Typical configuration includes:

- PostgreSQL database name, username, and password
- Backend port and database connection URL
- PulseGrid JWT secret and expiration settings
- ThingsBoard URL and server-side credentials
- Frontend API base URL
- MQTT/ThingsBoard simulator configuration

Do not commit `.env` files or real credentials.

### 3. Start the application

Start the required services:

```bash
docker compose up -d
```

Check service status:

```bash
docker compose ps
```

### 4. Start the IoT simulators

The Compose service names currently include `iot-simulator-1` and `iot-simulator-2`.

Start simulator 1:

```bash
docker compose up -d iot-simulator-1
```

Start simulator 2:

```bash
docker compose up -d iot-simulator-2
```

View simulator logs:

```bash
docker compose logs -f iot-simulator-1
```

The simulators are configured to publish changing telemetry every 5 seconds.

### 5. Open the application

Use the ports configured in `compose.yaml`. In the current local setup, ThingsBoard is exposed at:

- **ThingsBoard UI:** http://localhost:18080
- **ThingsBoard MQTT:** `localhost:11883`

The frontend and backend URLs should be confirmed from the current Compose port mappings.

## Docker Compose Services

Check the exact service names with:

```bash
docker compose config --services
```

The current Compose configuration includes:

| Service | Purpose |
|---|---|
| `thingsboard-db` | ThingsBoard database |
| `database` | PulseGrid PostgreSQL database |
| `thingsboard` | ThingsBoard platform |
| `backend` | PulseGrid NestJS API |
| `frontend` | PulseGrid React application |
| `iot-simulator-1` | First MQTT telemetry simulator |
| `iot-simulator-2` | Second MQTT telemetry simulator |
| `nginx` | Reverse proxy / web entry point |

## Useful Commands

### Start all services

```bash
docker compose up -d
```

### Start a specific service

```bash
docker compose up -d backend
docker compose up -d frontend
docker compose up -d iot-simulator-1
docker compose up -d iot-simulator-2
```

### View running services

```bash
docker compose ps
```

### Follow backend logs

```bash
docker compose logs -f backend
```

### Follow simulator logs

```bash
docker compose logs -f iot-simulator-1
docker compose logs -f iot-simulator-2
```

### Follow logs for multiple services

```bash
docker compose logs -f backend iot-simulator-1 iot-simulator-2
```

### Restart a service

```bash
docker compose restart backend
```

### Rebuild backend after code changes

```bash
docker compose up -d --build backend
```

### Stop services

```bash
docker compose stop
```

### Stop and remove Compose containers

```bash
docker compose down
```

> `docker compose down` does not remove named volumes by default. Avoid `docker compose down -v` unless you intentionally want to delete persisted data.

### Check available Compose services

```bash
docker compose config --services
```

## Device and Telemetry Flow

### Device creation

1. A user submits device details in the React frontend.
2. The frontend sends the request to the PulseGrid NestJS API.
3. The backend validates the request and creates the device in ThingsBoard.
4. ThingsBoard returns its device ID.
5. The backend stores the PulseGrid device record and ThingsBoard device reference in PostgreSQL.
6. The frontend receives the result and displays the device.

### Telemetry

The simulator sends telemetry to ThingsBoard using MQTT.

Typical telemetry keys:

```json
{
  "temperature": 25.5,
  "humidity": 60,
  "battery": 95
}
```

ThingsBoard MQTT telemetry topic:

```text
v1/devices/me/telemetry
```

The simulator publishes updated values every **5 seconds**. The actual values depend on the simulator implementation.

## Configuration

Configuration is managed through environment variables and Docker Compose.

Before changing configuration:

1. Inspect `compose.yaml`.
2. Check the backend and simulator environment files.
3. Confirm the correct service hostname when communicating between containers.
4. Use container service names for internal Docker communication.
5. Use `localhost` and exposed ports when accessing services from the host machine.

For example, a backend container should generally access ThingsBoard through its Compose service name and internal port, while a host-based command can use the exposed localhost port.

## Troubleshooting

### Port 3000 is already in use

Check the process listening on port 3000:

```bash
sudo ss -ltnp | grep :3000
```

If the Docker backend is already running, avoid starting another local NestJS process on the same port.

Check:

```bash
docker compose ps backend
```

### Simulator service not found

List the actual service names:

```bash
docker compose config --services
```

Use the exact service name, such as:

```bash
docker compose up -d iot-simulator-1
```

### ThingsBoard device creation returns HTTP 400

Inspect the ThingsBoard response body and the JSON payload sent to `POST /api/device`.

Check:

- Device name and uniqueness
- Request field names and data types
- Device profile configuration
- Payload transformations in the NestJS service

Do not assume HTTP 400 is an authentication problem.

### ThingsBoard is unavailable

Check service status and logs:

```bash
docker compose ps thingsboard
docker compose logs -f thingsboard
```

### Simulator is not publishing telemetry

Check simulator logs:

```bash
docker compose logs -f iot-simulator-1
```

Verify that:

- ThingsBoard is running.
- The simulator uses the correct MQTT host and port.
- The device access token is valid.
- The MQTT topic and telemetry payload are correct.

## Security Notes

- Never commit `.env` files, passwords, JWT secrets, API keys, or device tokens.
- Never put ThingsBoard administrator credentials in React/Vite environment variables.
- Keep privileged ThingsBoard API calls in NestJS.
- Use separate credentials for application users and IoT devices.
- Avoid logging complete tokens or sensitive request headers.
- Use appropriate authorization checks for device management endpoints.

## Development Notes

- Keep the existing Docker Compose architecture consistent.
- Rebuild only the services that need rebuilding.
- Check logs before changing configuration.
- Test device creation and telemetry after integration changes.
- Keep database migrations and environment configuration documented.

---

**PulseGrid** — IoT device management and telemetry monitoring platform.
