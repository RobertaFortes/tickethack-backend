# Tickethack Backend

REST API for the Tickethack application, built with Node.js, Express, and MongoDB.

## Tech Stack

- **Node.js** + **Express** — server and routing
- **Mongoose** — MongoDB ODM
- **dotenv** — environment variables
- **cors** — cross-origin resource sharing
- **nodemon** — dev auto-reload
- **Jest** + **Supertest** — testing

## Project Structure

```
tickethack-backend/
├── models/                 # Mongoose schemas + MongoDB connection
├── routes/                 # Express routers
├── app.js                  # Express app configuration
├── server.js               # App startup
├── .env                    # Environment variables (not committed)
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
```

### Running

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### Testing

```bash
npm test
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/trips` | List all trips |
