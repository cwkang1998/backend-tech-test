# Getting Started Guide



## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Yarn](https://classic.yarnpkg.com/) v1.22+
- A running MySQL instance

---

## Setup

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure environment variables

Following is the env vars that the server supports

| Variable | Description |
|----------|-------------|
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | MySQL database name |
| `PORT` | Port the server listens on (default: `8181`) |

### 3. Run in development mode

If you already have the database setup somewhere, you can do.

```bash
yarn dev
```

Otherwise, you can also use the provided `docker-compose.yml` to run the application in development mode.

```bash
docker compose up
```

### 4. Build and run in production

```bash
yarn build
yarn start
```

---

## API Documentation

To view the API docs locally via Swagger UI:

```bash
yarn docs
```

This will serve the docs at [http://localhost:8000](http://localhost:8000).

---

## Running Tests

### Unit tests

```bash
yarn test:unit
```

### Integration tests

> Requires a running MySQL instance configured. You can set it up using docker and the provided `docker-compose.test.yml`.

```bash
yarn test:integration
```

