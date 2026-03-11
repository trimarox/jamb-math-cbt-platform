# Server

The server component of the JAMB Mathematics CBT exam platform.

## Overview

This is the backend API server for the JAMB Math CBT platform. It handles:
- User authentication and authorization
- Exam data management
- Question storage and retrieval (both pre-made and AI-generated)
- Student progress tracking
- Admin functionality for managing exams and questions
- Integration with AI services for dynamic question generation

## Getting Started

### Prerequisites
- Node.js (or your runtime)
- [Any database requirements]
- [Any API keys or external services]

### Installation

```bash
# Install dependencies
npm install
```

### Configuration

Create a `.env` file in this directory with the following variables:
```
# Add your environment variables here
DATABASE_URL=
API_KEY=
# ... other configuration
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Exams
- `GET /api/exams` - List all exams
- `GET /api/exams/:id` - Get exam details
- `POST /api/exams/:id/start` - Start an exam
- `POST /api/exams/:id/submit` - Submit exam answers

### Questions
- `GET /api/questions` - Retrieve questions
- `GET /api/questions/:id` - Get specific question

### Progress & Results
- `GET /api/results/:userId` - Get user results

## Project Structure

```
server/
├── models/          # Database models
├── routes/          # API routes
├── controllers/     # Business logic
├── middleware/      # Authentication, validation, etc.
├── utils/          # Utility functions
└── config/         # Configuration files
```

## Database

[Add information about your database schema, migrations, and setup instructions]

## Testing

```bash
# Run tests
npm test
```

## Deployment

[Add deployment instructions for your platform]

## Contributing

Please follow the contribution guidelines in the main repository.

## License

This project is licensed under the MIT License - see the LICENSE file in the root directory for details.