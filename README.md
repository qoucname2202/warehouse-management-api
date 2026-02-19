# E-learning API

RESTful API for warehouse-management platform with Authentication, Permission (RBAC), and Image Upload.

## Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** (local or cloud)
- **npm** >= 9.x

## Installation

```bash
npm install
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in all required variables (DB URL, JWT secrets, Cloudinary, OTP email, etc.)
3. Ensure `APP_PORT` is one of: 3000, 5000, 5500, 8080, 443

## Running the Application

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Scripts

| Script                  | Description                      |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Start dev server with hot reload |
| `npm run build`         | Build TypeScript to dist/        |
| `npm start`             | Start production server          |
| `npm test`              | Run tests                        |
| `npm run test:watch`    | Run tests in watch mode          |
| `npm run test:coverage` | Run tests with coverage report   |
| `npm run lint`          | Run ESLint                       |
| `npm run lint:fix`      | Run ESLint with auto-fix         |
| `npm run prettier`      | Check code formatting            |
| `npm run prettier:fix`  | Format code with Prettier        |

## API Endpoints

### Auth (`/api/v1/auth`)

- POST `/register` - Register new user
- POST `/login` - Login
- POST `/logout` - Logout
- POST `/refresh-token` - Refresh access token
- POST `/change-password` - Change password (authenticated)
- POST `/forgot-password`, `/reset-password`, `/verify-email`, etc.

### Users (`/api/v1/users`)

- GET `/profile` - Get current user profile
- PUT `/profile` - Update profile
- POST `/profile/avatar` - Upload avatar image
- POST `/profile/cover` - Upload cover photo

### Roles (`/api/v1/roles`)

- CRUD operations (requires admin/permission)

### Permissions (`/api/v1/permissions`)

- CRUD operations (requires admin/permission)

## Project Structure

```
src/
├── config/          # Environment and app config
├── controllers/     # Request handlers
├── middlewares/     # Express middlewares
├── models/          # MongoDB schemas
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Helpers and utilities
├── validation/      # Request validation
└── index.ts         # Entry point
```

## Documentation

- Swagger UI: `http://localhost:{APP_PORT}/api-docs` (credentials: admin123/admin123)

## License

MIT
