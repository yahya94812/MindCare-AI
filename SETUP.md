# MindCare AI - Setup Guide

## 🚀 Quick Start

Follow these steps to get MindCare AI running on your local machine.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account
- Google Cloud Console account
- Google AI Studio account

### 1. Installation

```bash
# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
```

### 2. Setup Required Services

#### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (free tier is sufficient)
3. Create a database user with read/write permissions
4. Get your connection string
5. Add your connection string to `.env` file:
   ```
   VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindcare-ai?retryWrites=true&w=majority
   ```

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" and create "OAuth 2.0 Client ID"
5. Add your domain to authorized origins (for development: `http://localhost:5173`)
6. Copy the Client ID to `.env` file:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

#### Gemini AI Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `.env` file:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

### 3. Run the Application

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Usage

1. **Sign In**: Use Google OAuth to authenticate
2. **Journal Entry**: Write your daily morning, afternoon, and evening thoughts
3. **AI Analysis**: Submit your entries to get mood analysis and personalized tips
4. **Dashboard**: View your mood trends, charts, and monthly insights

## 🛠️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── AuthPage.jsx    # Authentication page
│   ├── JournalEntry.jsx # Journal entry form
│   └── Dashboard.jsx   # Analytics dashboard
├── hooks/              # Custom React hooks
├── services/           # External API services
├── lib/                # Utilities and configuration
└── utils/              # Helper functions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Tech Stack

- **Frontend**: React + Vite + JavaScript
- **Styling**: TailwindCSS + shadcn/ui
- **Charts**: Recharts
- **Database**: MongoDB Atlas
- **Authentication**: Google OAuth
- **AI**: Google Gemini API

## 🔧 Configuration

All configuration is handled through environment variables. See `.env.example` for all available options.

## 📝 Features

### Journal Entry
- Three daily entries (Morning, Afternoon, Evening)
- AI-powered mood classification
- Personalized tips and suggestions
- Mood scoring (1-10 scale)

### Dashboard
- Daily mood trends visualization
- Monthly behavior analysis
- Mood distribution charts
- AI-generated insights

### Authentication
- Secure Google OAuth integration
- User profile management
- Session persistence

## 🚨 Important Notes

- This is a demo application with exposed API keys for development purposes
- Do not use in production without proper security measures
- All journal data is stored in MongoDB and associated with user accounts
- AI analysis requires active internet connection

## 🆘 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed with `npm install`
2. **Authentication Issues**: Check Google OAuth configuration and domain settings
3. **API Errors**: Verify all API keys are correctly set in `.env` file
4. **Database Connection**: Ensure MongoDB URI is correct and cluster is accessible

### Getting Help

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure all required services (MongoDB, Google APIs) are properly configured

## 📄 License

This project is for educational and demonstration purposes.
