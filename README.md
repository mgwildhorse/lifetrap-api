# Lifetrap Reflection Tool API

Simple API for the Lifetrap Canvas app with PostgreSQL persistence.

## Endpoints

- `POST /api/save-assessment` - Save assessment results
- `GET /api/get-assessments?userId=xxx` - Get user assessments
- `POST /api/save-checkin` - Save daily check-in
- `GET /api/get-checkins?userId=xxx&days=30` - Get recent check-ins

## Environment Variables

- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password

## Deployment

Deployed on Vercel with automatic GitHub integration.
