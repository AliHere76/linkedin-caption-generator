# 🚀 LinkedIn Caption Generator

An AI-powered LinkedIn caption generator built with Next.js 15, featuring user authentication, caption history, and integration with Google's Generative AI. Create engaging, professional LinkedIn captions effortlessly!

## ✨ Features

- 🤖 **AI-Powered Caption Generation** - Leverages Google's Generative AI (Gemini) to create engaging LinkedIn captions
- 🔐 **User Authentication** - Secure sign-up and sign-in with NextAuth.js
- 📝 **Caption History** - Save and manage your generated captions
- 🎨 **Modern UI** - Beautiful, responsive interface built with Tailwind CSS and Framer Motion
- 🔍 **Multiple Tones** - Generate captions in different tones (Professional, Casual, Inspiring, Humorous)
- 💾 **MongoDB Integration** - Persistent storage for users and captions
- 🎯 **Real-time Updates** - Instant caption generation and updates
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 19** - UI library
- **NextAuth.js** - Authentication
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Token-based authentication
- **Bcrypt.js** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### AI Integration
- **Google Generative AI (Gemini)** - Caption generation

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/linkedin-caption-generator.git
cd linkedin-caption-generator
```

### 2. Install Dependencies

Install dependencies for both frontend and backend:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google Generative AI
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Backend API URL (if running separately)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

### 5. Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your `.env.local` file

## 🏃‍♂️ Running the Application

### Option 1: Run Frontend and Backend Separately

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run backend
```

### Option 2: Run Both Concurrently

```bash
npm run dev:all
```

The application will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

## 📦 Build for Production

### Build the Frontend

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Run Backend in Production

```bash
cd backend
npm start
```

## 📁 Project Structure

```
linkedin-caption-generator/
├── backend/                    # Express.js backend
│   ├── config/                # Database configuration
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Authentication & error handling
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   └── server.js              # Backend entry point
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── captions/     # Caption CRUD operations
│   │   │   └── generate-caption/ # AI caption generation
│   │   ├── dashboard/        # Main dashboard page
│   │   ├── layout.js         # Root layout
│   │   └── page.js           # Landing/Auth page
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── CaptionGenerator.jsx
│   │   ├── CaptionHistory.jsx
│   │   └── Navbar.jsx
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── models/              # Frontend data models
├── public/                  # Static assets
└── package.json            # Dependencies and scripts
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Run frontend with Turbopack
npm run backend         # Run backend server
npm run dev:all         # Run both frontend and backend

# Production
npm run build           # Build for production
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint
```

## 🚢 Deployment

### Deploy on Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy Backend

Deploy the backend to services like:
- Railway
- Render
- Heroku
- DigitalOcean

Update the `NEXT_PUBLIC_API_URL` in your frontend environment variables.
