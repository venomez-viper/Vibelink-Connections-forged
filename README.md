# VibeLink — Personality-First Dating App

VibeLink is a modern dating platform that puts personality before photos. Users complete a 10-page personality questionnaire, get matched via a weighted compatibility algorithm, chat text-only first, and only unlock photos after building a genuine connection. Personal contact details are automatically masked in all messages.

---

## Features

- **10-Page Personality Questionnaire** — Life goals, communication style, social battery, relationship goals, hobbies, emotional intelligence, humor, deal-breakers, and match preferences
- **Weighted Matching Algorithm** — Compatibility scored across 7 dimensions (relationship goals, love languages, social battery, life goals, conflict style, interests, humor)
- **Text-First Chat** — No photos visible until both users mutually consent to unlock them
- **Contact Detail Masking** — Phone numbers, emails, @handles, and URLs are automatically hidden in messages
- **Photo Unlock Flow** — Mutual consent required before profile photos are revealed
- **Real-Time Messaging** — Live chat with typing indicators and read receipts
- **Analytics Dashboard** — Match success rate, response rate, profile completeness

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| UI | shadcn/ui, Tailwind CSS, Radix UI |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Edge Functions | Deno (compatibility scoring) |
| Forms | React Hook Form + Zod |
| State | TanStack Query |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project ([supabase.com](https://supabase.com))

### Installation

```sh
# Clone the repository
git clone https://github.com/venomez-viper/Vibelink-Connections-forged.git
cd Vibelink-Connections-forged

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase URL and anon key to .env

# Start the development server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Database Setup

Run the SQL migrations in your Supabase dashboard in order:

```
supabase/migrations/
```

Or use the Supabase CLI:

```sh
supabase db push
```

---

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ChatWindow.tsx  # Real-time chat with contact masking + photo unlock
│   ├── Hero.tsx        # Landing page hero section
│   └── Features.tsx    # Feature showcase
├── pages/
│   ├── SignUp.tsx      # 10-page personality questionnaire
│   ├── Dashboard.tsx   # Match cards with personality traits
│   ├── Messages.tsx    # Conversation list (photos hidden until unlocked)
│   └── Discover.tsx    # Profile discovery
├── utils/
│   └── matchingAlgorithm.ts  # Weighted personality compatibility scoring
└── integrations/
    └── supabase/       # Supabase client and type definitions

supabase/
├── functions/
│   └── calculate-compatibility/  # Edge function for match scoring
└── migrations/                   # Database schema migrations
```

---

## How Matching Works

Compatibility is scored using a weighted algorithm across 7 dimensions:

| Dimension | Weight |
|-----------|--------|
| Relationship Goal | 25% |
| Love Language (Jaccard similarity) | 20% |
| Social Battery | 15% |
| Life Goals | 15% |
| Conflict Style | 10% |
| Shared Interests | 10% |
| Humor Type | 5% |

---

## Photo Unlock Flow

1. Both users chat text-only by default
2. Either user can click **"Unlock Photos"** in the chat header
3. The other user sees a banner: *"Your match wants to share photos!"*
4. When both accept → `photo_unlock_status = 'unlocked'` → photos become visible

---

## Deployment

Build for production:

```sh
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, etc.) and point your Supabase edge functions to the same project.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

## License

MIT
