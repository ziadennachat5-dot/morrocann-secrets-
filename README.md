# Moroccan Secrets

Dine with a Moroccan family in Marrakesh. Authentic home-cooked dinners, cooking workshops, and cultural connections in private riads.

## Features

- **Home Dining Experiences**: Intimate dinners and cooking workshops hosted by local families in Marrakesh riads.
- **Multilingual Support**: English, French, and Arabic with full RTL support.
- **Responsive Design**: Mobile-first layout crafted with Tailwind CSS v4 and custom typography.
- **SSR & Modern Routing**: Powered by TanStack Start, TanStack Router, and Nitro.
- **Database & Auth**: Integrated with Supabase.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) & React 19
- **Bundler & Build**: [Vite](https://vitejs.dev) & [Nitro](https://nitro.unjs.io)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Database / Backend**: [Supabase](https://supabase.com)
- **Testing**: [Vitest](https://vitest.dev) & React Testing Library

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd moroccan-secrets

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Development

```bash
npm run dev
```

The application will be running at `http://localhost:8080`.

### Building for Production

```bash
npm run build
```

### Testing

```bash
npm test
```

## Environment Variables

See `.env.example` for all configurable environment variables, including:

- `VITE_SITE_URL`: The canonical public URL (e.g. `https://moroccansecrets.com`)
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase anon/publishable key
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side administrative key
- `CRON_SECRET`: Secret token for scheduled server tasks
- `OWNER_WHATSAPP_NUMBER`: Direct WhatsApp contact for reservations

## License

Private / All rights reserved.
