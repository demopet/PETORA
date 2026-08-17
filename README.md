# Petora - Sistem Manajemen Terpadu Petshop & Petcare

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Library**: shadcn/ui + Tailwind CSS v4
- **State Management**: TanStack Query + Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Deployment**: Vercel

## Prerequisites

- Node.js >= 20
- npm >= 10
- Supabase CLI
- Git

## Setup

1. Clone repository
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
3. Run `npm install`
4. Run `supabase start` to start local Supabase
5. Run `npm run db:push` to apply migrations
6. Run `npm run db:seed` to seed test data
7. Run `npm run dev` to start development server

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run E2E tests
- `npm run db:push` - Apply database migrations
- `npm run db:seed` - Seed test data

## Project Structure

```
src/
├── features/          # Feature-based modules
├── components/        # Shared components
│   ├── ui/           # shadcn/ui components
│   └── layout/       # Layout components
├── lib/              # Utilities and services
├── schemas/          # Zod validation schemas
├── types/            # TypeScript types
├── hooks/            # Custom React hooks
└── stores/           # Zustand stores
```

## Documentation

- [Architecture](./master-arsitektur.md)
- [Frontend Spec](./master-spesifikasi-frontend.md)
- [Module Spec](./master-spesifikasii-modul.md)
- [Testing Spec](./master-test-cidi.md)
- [Roadmap](./roadmap.md)
