# UOE AI Assistant Frontend

AI-powered academic assistant for University of Education Lahore, built with React, Vite, and Tailwind CSS.

## Features

- AI-powered chat interface for academic queries
- Smart RAG (Retrieval-Augmented Generation) with self-correcting retrieval
- Multiple knowledge bases: BS/ADP, MS/PhD, and University Rules
- Streaming responses with source citations
- User feedback system (thumbs up/down)
- Dark cinematic UI with smooth animations

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `/api`)

## Deployment

This project is configured for Vercel deployment. Set `VITE_API_URL` in your Vercel environment variables.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Zustand (state management)
- React Router DOM
