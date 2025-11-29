# MusicGen - AI Music Creation Platform

A full-stack web application for creating music using AI. Users can generate songs from text prompts using the MusicGen model, with support for both free and premium tiers.

## Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Music Generation**: Create songs from text prompts using AI
- **Background Processing**: Async song generation with threading
- **Cloud Storage**: Store generated songs in Google Cloud Storage
- **Payment Integration**: Stripe subscription for premium features
- **Responsive UI**: Clean, accessible design that works on web and mobile
- **CRUD Operations**: Full control over song management

## Tech Stack

### Backend
- Flask (Python web framework)
- Supabase (PostgreSQL database)
- Background threading (async tasks)
- Google Cloud Storage (file storage)
- Stripe (payment processing)
- MusicGen (AI model for music generation)
- JWT (authentication)

### Frontend
- React 18
- React Router (navigation)
- Tailwind CSS (styling)
- Axios (API calls)
- Stripe.js (payment integration)

## Architecture

The application follows a clean, modular architecture:

```
backend/
├── app.py              # Flask application factory
├── config.py           # Configuration management
├── models/             # Pydantic data models
├── services/           # Business logic layer
├── routes/             # API endpoints
├── middleware/         # Auth middleware
├── tasks/              # Background tasks
└── db/                 # Database schema

frontend/
├── public/             # Static files
└── src/
    ├── components/     # Reusable components
    ├── pages/          # Page components
    ├── context/        # React context (auth)
    ├── services/       # API client
    └── App.js          # Main application
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- Redis
- Google Cloud account (for GCS)
- Stripe account
- Supabase project

### Backend Setup

1. Install dependencies:
```bash
cd backend
uv pip install -r requirements.txt
```

2. Copy environment file and configure:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Set up Supabase database:
```bash
# Run the schema.sql in your Supabase project
```

4. Start Flask server:
```bash
python app.py
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Production Deployment

### Backend

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()
```

### Frontend

The backend serves the built React app from `frontend/build`. Just build the frontend and restart the backend.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

### Songs
- `POST /api/songs` - Create new song
- `GET /api/songs` - Get user's songs
- `GET /api/songs/:id` - Get song details
- `PUT /api/songs/:id` - Update song
- `DELETE /api/songs/:id` - Delete song

### Payment
- `POST /api/payment/create-checkout-session` - Create Stripe checkout
- `POST /api/payment/webhook` - Handle Stripe webhooks
- `POST /api/payment/cancel-subscription` - Cancel subscription
- `GET /api/payment/config` - Get Stripe config

## User Tiers

### Free Tier
- Unlimited songs
- Max 256 tokens per song
- Fixed token limit

### Premium Tier ($9.99/month)
- Unlimited songs
- Up to 4096 tokens per song
- Configurable token limits
- Longer song generation

## Accessibility

The frontend conforms to WCAG 2.2 Level AA guidelines:
- Proper semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader support

## Design Principles

- **DRY**: Code reuse through services and components
- **SOLID**: Single responsibility, dependency injection
- **Separation of Concerns**: Clear layer boundaries
- **Scalability**: Async processing, modular architecture
- **Security**: JWT auth, input validation, secure payments

## License

MIT
