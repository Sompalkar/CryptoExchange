# Centralized Exchange Platform

A comprehensive centralized cryptocurrency exchange platform with separate backend and frontend components.

## Project Structure

The project is organized into two main directories:

- `/backend` - GoLang server handling authentication, trading engine, order management, and database interactions
- `/frontend` - Next.js application providing the user interface

## Features

- User authentication and KYC verification
- Real-time market data and order books
- Trading interface with limit and market orders
- Wallet management for deposits and withdrawals
- Portfolio tracking and order history

## Backend (GoLang)

The backend is built with GoLang and uses the following technologies:

- Gin framework for REST APIs
- Gorilla WebSocket for real-time communication
- JWT for authentication
- PostgreSQL for data storage (configured but not implemented in this example)

### Backend Structure

\`\`\`
/backend
├── cmd
│   └── api
│       └── main.go           # Application entry point
├── internal
│   ├── auth                  # Authentication handlers
│   ├── market                # Market data handlers
│   ├── order                 # Order management
│   ├── user                  # User management
│   ├── wallet                # Wallet operations
│   └── websocket             # Real-time communication
└── pkg                       # Shared packages
\`\`\`

## Frontend (Next.js)

The frontend is built with Next.js and uses the following technologies:

- React for UI components
- Tailwind CSS for styling
- shadcn/ui component library
- WebSocket for real-time updates

### Frontend Structure

\`\`\`
/frontend
├── app                       # Next.js App Router
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── trade                 # Trading pages
├── components                # Reusable components
│   ├── layout                # Layout components
│   ├── trade                 # Trading components
│   └── ui                    # UI components
└── public                    # Static assets
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+
- Go 1.20+
- PostgreSQL (for production)

### Running the Backend

\`\`\`bash
cd backend
go mod tidy
go run cmd/api/main.go
\`\`\`

### Running the Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Development

This project follows a clean architecture approach with separation of concerns between the backend and frontend.

### Backend Development

The backend follows standard Go project layout with:

- `cmd` for application entry points
- `internal` for application-specific code
- `pkg` for code that could be used by external applications

### Frontend Development

The frontend follows Next.js App Router conventions with:

- Page components in the `app` directory
- Reusable components in the `components` directory
- Server Components for improved performance
- Client Components for interactive elements

## Deployment

For production deployment:

1. Build the backend: `go build -o exchange-api ./cmd/api`
2. Build the frontend: `npm run build`
3. Deploy the backend binary and frontend build to your hosting environment

## Security Considerations

- All API endpoints that handle sensitive operations are protected with JWT authentication
- Passwords are hashed using bcrypt
- WebSocket connections are authenticated
- CORS is configured to restrict access to trusted domains

## License

MIT
