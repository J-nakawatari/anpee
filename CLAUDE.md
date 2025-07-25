# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Anpee (あんぴーちゃん)** is a family monitoring service that performs daily safety checks via LINE and phone calls. The service sends "元気ですボタン" (I'm fine button) notifications and alerts administrators when family members don't respond.

## Key Commands

### Frontend Development
```bash
cd frontend
npm install                    # Install dependencies
npm run dev                    # Start dev server (http://localhost:3003)
npm run build                  # Build for production
npm run lint                   # Run ESLint
npm run type-check             # Run TypeScript type checking
```

### Backend Development
```bash
cd backend
npm install                    # Install dependencies
npm run dev                    # Start dev server (http://localhost:4003)
npm run build                  # Build TypeScript to JavaScript
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run typecheck              # Run TypeScript type checking
```

### Deployment
```bash
# On production server
cd /var/www/anpee
bash deploy.sh                 # Automated deployment script
```

### PM2 Process Management
```bash
pm2 list                       # List all processes
pm2 logs anpee                 # Frontend logs
pm2 logs anpee-backend         # Backend logs
pm2 restart anpee anpee-backend # Restart both services
```

## Architecture Overview

### Frontend Structure
- **Framework**: Next.js 15 with App Router
- **Entry Points**: All user pages under `/user/*` prefix
- **Authentication**: JWT tokens stored in localStorage/sessionStorage
- **API Communication**: Uses `apiClient` service with CSRF protection
- **State Management**: React hooks and context (no external state library)
- **UI Components**: shadcn/ui components with custom styling
- **Styling**: Tailwind CSS with custom "cute" theme (orange/warm colors)

### Backend Structure
- **Framework**: Express.js with TypeScript
- **Authentication**: JWT with refresh tokens, stored in httpOnly cookies
- **Database**: MongoDB Atlas with Mongoose ODM
- **API Routes**: RESTful under `/api/v1/*`
- **Middleware Stack**: CORS, CSRF protection, rate limiting, helmet
- **External Services**:
  - SendGrid for email notifications
  - LINE Messaging API for LINE notifications
  - Twilio for phone calls (currently disabled)
  - Stripe for subscription billing

### Key Business Logic

1. **Daily Notifications**:
   - Cron job runs at configured times
   - Sends LINE messages to registered family members
   - Tracks responses and triggers re-notifications
   - Sends summary emails to administrators

2. **Subscription Plans**:
   - Standard Plan: 1 family member monitoring
   - Family Plan: Up to 3 family members
   - Managed through Stripe subscriptions

3. **LINE Integration**:
   - Each family member gets a unique registration code
   - Users add the official LINE account and send their code
   - System links LINE User ID to family member record

## Important Terminology

### Use These Terms:
- **家族** (family) - The monitored persons (never use "高齢者/elderly")
- **家族管理** - Family member management
- **元気ですボタン** - The "I'm fine" button in LINE
- **見守り** - Monitoring/watching over

### Avoid These Terms:
- ❌ 高齢者, elderly, senior citizens
- ❌ お年寄り
- ❌ シニア

## Current Status Notes

### Phone Notification Feature (Temporarily Disabled)
- Technical implementation exists but UI is hidden
- Requires corporate entity for phone services in Japan
- To re-enable: Uncomment sections in `NotificationSettingsPage.tsx`
- Backend endpoints remain functional at `/notifications/test/phone`

### Environment Configuration
- Frontend runs on port 3003
- Backend runs on port 4003
- Production uses Nginx reverse proxy with IPv6 support
- API paths `/api/*` are proxied to backend

### Critical Workflows

1. **User Registration Flow**:
   - Email verification required
   - Sends verification email via SendGrid
   - JWT tokens issued on successful verification

2. **Family Member Registration**:
   - Add family member details
   - System generates unique LINE registration code
   - Family member adds LINE bot and sends code
   - System links LINE account to family member

3. **Notification Flow**:
   - Check notification settings and timing
   - Send LINE messages to all active family members
   - Wait for responses (button clicks)
   - Trigger re-notifications based on settings
   - Send admin notifications for non-responses

## Database Schema Highlights

- **User**: Main account holder with subscription info
- **Elderly**: Family members being monitored (linked to User)
- **NotificationLog**: Records of all notifications sent
- **ResponseLog**: Records of family member responses
- **Subscription**: Stripe subscription details

## Security Considerations

- CSRF tokens required for all non-GET requests
- JWT tokens expire in 15 minutes (refresh token in 7 days)
- Rate limiting on all API endpoints
- Input validation using express-validator
- XSS protection via helmet and input sanitization