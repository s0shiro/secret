# Secret Page

A social secret-sharing application where authenticated users can create secret messages, manage friendships, and view friends' secrets.

## Features

- **Authentication** - User registration and login with Supabase Auth
- **Secret Messages** - Create and edit your personal secret message
- **Friends System** - Send friend requests, accept/decline, and manage friendships
- **View Friends' Secrets** - Only accepted friends can see each other's secrets
- **Dark/Light Theme** - Toggle between dark and light mode
- **Account Management** - Sign out or delete your account

## Tech Stack

- **Next.js 16** - App Router with Server Components and Server Actions
- **React 19** - Latest React features including `useActionState`
- **TypeScript 5** - Strict mode enabled
- **Tailwind CSS v4** - CSS-first configuration
- **Supabase** - Authentication and PostgreSQL database
- **Drizzle ORM** - Type-safe database queries and migrations
- **Zod** - Schema validation for forms

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([create one here](https://supabase.com))

### Environment Setup

1. Copy the example environment file:

```bash
cp example.env.local .env.local
```

2. Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_drizzle_connection_string
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Installation

```bash
npm install
```

### Database Setup

Generate and run migrations:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
src/
├── app/                    # App Router pages and layouts
│   ├── (auth)/            # Auth routes (login/register)
│   └── (protected)/       # Protected routes requiring auth
│       ├── secret-page-1/ # View your secret
│       ├── secret-page-2/ # Edit your secret
│       └── secret-page-3/ # Friends management
├── components/            # Reusable UI components
├── db/                    # Drizzle schema and migrations
└── lib/                   # Utilities and server actions
    ├── actions/           # Server Actions (auth, secrets, friends)
    └── supabase/          # Supabase client utilities
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit generate` | Generate migrations |
| `npx drizzle-kit migrate` | Run migrations |
| `npx drizzle-kit studio` | Open Drizzle Studio GUI |

## License

MIT
