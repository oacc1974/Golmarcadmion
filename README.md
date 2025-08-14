# Golmarc Admin - Loyverse Integration System

A comprehensive administrative system for Loyverse POS data, integrating with MongoDB and providing reporting and management capabilities.

## Project Structure

The project is organized as a monorepo with the following structure:

```
golmarcadmin/
├── apps/
│   ├── api/           # NestJS backend API
│   └── web/           # Next.js frontend dashboard
├── libs/
│   └── shared/        # Shared code, interfaces, and utilities
├── infra/             # Infrastructure configuration
├── docker-compose.yml # Docker Compose for local development
└── .env.example       # Example environment variables
```

## Features

- **Data Integration with Loyverse POS**
  - Webhook integration for real-time updates
  - Backfill functionality for historical data
  - Idempotent operations with Loyverse IDs

- **Comprehensive Data Model**
  - Stores, Employees, Items
  - Receipts with line items and payments
  - Shifts with reconciliation
  - Webhook events with status tracking

- **Role-Based Access Control**
  - JWT-based authentication
  - User roles: admin, gerente (manager), cajero (cashier), auditor

- **Reporting**
  - Sales summaries by date range
  - Payment method breakdowns
  - Shift summaries and reconciliation
  - Dashboard with key metrics

- **Modern Web Dashboard**
  - Sales visualization
  - Shift management
  - User-friendly interface with TailwindCSS

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Loyverse POS account with API access

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/your-organization/golmarcadmin.git
cd golmarcadmin
```

2. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the infrastructure with Docker Compose**

```bash
docker-compose up -d
```

4. **Install dependencies**

```bash
npm install
```

5. **Start the API development server**

```bash
npm run start:api:dev
```

6. **Start the Web development server**

```bash
npm run start:web:dev
```

7. **Access the applications**
   - API: http://localhost:3001/api
   - API Documentation: http://localhost:3001/api/docs
   - Web Dashboard: http://localhost:3000
   - MongoDB Express: http://localhost:8081

## API Documentation

The API documentation is available through Swagger UI at `/api/docs` when the API is running.

## Data Model

- **Stores**: Information about Loyverse stores
- **Employees**: Staff members from Loyverse
- **Items**: Products and services from Loyverse
- **Receipts**: Sales transactions with line items and payments
- **Shifts**: Cash register shifts with opening/closing amounts
- **Users**: System users with role-based permissions

## Webhook Integration

The system provides endpoints for Loyverse webhooks to enable real-time data synchronization:

1. Register a webhook in the admin dashboard
2. Configure the webhook in Loyverse to point to your API endpoint
3. The system will automatically process incoming webhook events

## Backfill Process

For historical data, the system provides backfill functionality:

1. Navigate to the Integration section in the dashboard
2. Select the data type and date range
3. Initiate the backfill process

## Development

### API (NestJS)

```bash
# Development
npm run start:api:dev

# Production build
npm run build:api
```

### Web Dashboard (Next.js)

```bash
# Development
npm run start:web:dev

# Production build
npm run build:web
```

## Deployment

The application can be deployed using Docker Compose for production:

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d
```

## License

This project is proprietary and confidential.
