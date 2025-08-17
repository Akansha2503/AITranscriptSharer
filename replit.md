# Meeting Summary Generator

## Overview

This is a full-stack web application that generates AI-powered meeting summaries from transcript uploads. Users can upload meeting transcripts, provide custom instructions, and receive structured summaries generated using the Groq API with the Llama model. The application also includes email functionality to share summaries with team members.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Wouter**: Lightweight client-side routing library for navigation
- **TanStack Query**: Data fetching and state management for API calls
- **Shadcn/ui Components**: Pre-built UI component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Fast development server and build tool

### Backend Architecture
- **Express.js**: Node.js web application framework handling REST API endpoints
- **TypeScript**: Type-safe server-side development
- **In-Memory Storage**: Simple storage implementation using Map for development (production would use database)
- **File Upload**: Custom file upload component for transcript processing
- **Session Management**: Uses connect-pg-simple for PostgreSQL session storage

### Database Schema
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Summaries Table**: Stores transcript text, custom instructions, generated summaries, and timestamps
- **Schema Validation**: Zod schemas for runtime type checking and validation

### AI Integration
- **Groq API**: External AI service using Llama-3.3-70b-versatile model
- **Prompt Engineering**: Structured prompts for generating meeting summaries with HTML formatting
- **Error Handling**: Comprehensive error handling for API failures and rate limiting

### Email Integration
- **Nodemailer**: Email service for sending summaries to recipients
- **Email Templates**: HTML-formatted email templates for professional summary delivery
- **Validation**: Email address validation and content sanitization

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimizations with runtime error overlays
- **Hot Module Replacement**: Fast development iteration with Vite HMR

### Security Considerations
- **Input Validation**: Zod schemas validate all user inputs
- **File Size Limits**: 10MB maximum file upload size
- **Environment Variables**: Secure API key management
- **CORS Configuration**: Proper cross-origin request handling

## External Dependencies

### Third-Party Services
- **Groq API**: AI model hosting service for text generation using Llama models
- **Neon Database**: Serverless PostgreSQL database provider
- **Email Service Provider**: SMTP service for email delivery (configured via Nodemailer)

### Key Libraries
- **@radix-ui/react-***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Database ORM with PostgreSQL support
- **wouter**: Lightweight routing
- **tailwindcss**: CSS framework
- **zod**: Schema validation
- **nodemailer**: Email sending
- **class-variance-authority**: Styling utilities

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type checking and compilation
- **ESBuild**: Production bundling
- **PostCSS**: CSS processing with Tailwind