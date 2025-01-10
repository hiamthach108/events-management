# Events Management System

A comprehensive system for managing events, registrations, and attendees. This application provides REST APIs for event organization and management.

## Features

- User authentication (Local and Google OAuth)
- Event management (Create, Update, List, Details)
- Event registration system
- Attendee management
- Check-in system
- Health monitoring endpoints

## Prerequisites

Before you begin, ensure you have the following installed:
- Docker
- Docker Compose
- Git

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/hiamthach108/events-management.git
cd events-management
```

3. Start the application using Docker Compose:
```bash
make run-app
```
or
```bash
docker-compose up	--build -d
```

The application should now be running at `http://localhost:8080`

## Services

The Docker Compose setup includes the following services:
- **API Server**: Node.js application running the REST API
- **PostgreSQL**: Main database
- **Redis**: Cache and session management
- **Swagger UI**: API documentation available at `http://localhost:8080/swagger`

## API Documentation

Once the application is running, you can access the full API documentation at:
```
http://localhost:8080/swagger
```

## Development

#### Google OAuth Setup
Configure and Create OAuth 2.0 Credentials before and add these to your `.env` file:
```properties
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:8080/api/v1/auth/google/callback
```

## Troubleshooting

1. If you encounter database connection issues:
   - Ensure PostgreSQL container is running: `docker ps`
   - Check logs: `docker-compose logs postgres`

2. If Redis connection fails:
   - Verify Redis container status: `docker ps`
   - Check logs: `docker-compose logs redis`

## License

This project is licensed under the MIT License - see the LICENSE file for details.