# Overview

This is a modern full-stack expense tracking application called "ExpenseJournal" built with React/TypeScript frontend and Express.js backend. The application provides comprehensive financial management features including expense tracking, budgeting, goal setting, AI-powered insights, and multi-language support. It uses a PostgreSQL database with Drizzle ORM and integrates Replit's authentication system for user management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **Routing**: Wouter for client-side routing with protected routes for authenticated users
- **State Management**: TanStack Query (React Query) for server state and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Authentication**: Replit's OpenID Connect (OIDC) authentication with Passport.js strategy
- **Session Management**: PostgreSQL-backed session storage using connect-pg-simple
- **API Design**: RESTful API with JSON responses and comprehensive error handling
- **File Uploads**: Multer middleware for handling expense receipts and attachments

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Key Tables**: users, expenses, budgets, goals, categories, notifications, sessions
- **Data Types**: Supports decimal precision for financial amounts, JSONB for flexible data storage
- **Relationships**: Foreign key constraints with cascade deletion for data integrity

## Authentication & Authorization
- **Provider**: Replit Auth using OpenID Connect protocol
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Middleware**: Custom authentication middleware for route protection
- **User Management**: Automatic user creation/updates with profile preferences

## Internationalization & Theming
- **Languages**: English and Italian support with React Context-based i18n
- **Themes**: Light/dark mode toggle with CSS custom properties
- **Persistence**: Theme and language preferences stored in localStorage and user profile

## AI Integration
- **Provider**: OpenAI GPT-5 for expense analysis and financial advice
- **Features**: Automatic expense categorization, spending pattern analysis, personalized recommendations
- **Services**: Dedicated AI service layer with structured prompt engineering

## File Handling & Storage
- **Upload Processing**: Multer with file type validation (images, PDFs)
- **Storage**: Local filesystem with configurable size limits
- **Supported Formats**: JPEG, PNG, GIF, PDF for expense receipts

## Development & Deployment
- **Build System**: Vite for frontend bundling, ESBuild for backend compilation
- **Development**: Hot module replacement with Vite dev server
- **Environment**: Replit-optimized with cartographer integration for development
- **Type Safety**: Shared TypeScript schemas between frontend and backend

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL database with connection pooling
- **Database URL**: Environment variable-based configuration

## Authentication Services
- **Replit Auth**: OpenID Connect provider for user authentication
- **Session Store**: PostgreSQL-backed session management

## AI Services
- **OpenAI API**: GPT-5 model for expense analysis and financial insights
- **API Key**: Environment variable configuration for secure access

## Currency Services
- **Exchange Rate API**: Real-time currency conversion rates
- **Fallback**: Default exchange rates when API is unavailable

## UI Component Libraries
- **Radix UI**: Headless UI primitives for accessibility
- **shadcn/ui**: Pre-styled component library built on Radix
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Replit Integration**: Cartographer for development environment optimization
- **Runtime Error Overlay**: Development error handling and debugging

## File Upload Dependencies
- **Multer**: Multipart form data handling for file uploads
- **File Validation**: Type and size restrictions for security