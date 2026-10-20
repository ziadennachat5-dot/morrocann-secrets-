# Moroccan Secrets Riad

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

## Site Photography

- Responsive, metadata-stripped JPEG and WebP renditions live in `public/images/`.
- Their dimensions, crop positions, and English, French, and Arabic alt text are maintained in `src/lib/photos.ts`.
- Root-level source photos stay ignored and are not copied into the deployed public assets. Do not use `RIAD.png` as a photo; it belongs in `public/brand/` as the logo.
- Generate renditions only up to each source image's actual width; do not upscale small photos to fill a larger breakpoint.

## Booking Configuration

The booking flow displays only published Supabase experiences and explicit future availability rows. It does not invent open dates or accept bookings without an availability row, a configured ISO currency, and reviewed cancellation text in English, French, and Arabic. Requests are saved as pending bookings; no payment is collected.

Configure `BOOKING_CURRENCY`, `BOOKING_RATE_LIMIT_SECRET`, and `CANCELLATION_POLICY_EN`, `CANCELLATION_POLICY_FR`, and `CANCELLATION_POLICY_AR` in the deployment environment. The server rate limit uses Cloudflare's connecting-IP header and a database counter; booking requests fail closed if its secret or client IP is missing. Apply the Supabase migration before enabling the flow.

Trust information (included items, practical details, family-home explanation, and safety/hygiene text) is stored as multilingual records in `site_settings`. Public sections remain hidden until all EN/FR/AR text is saved and marked public. Approved reviews are loaded from the `reviews` table; unapproved and incomplete multilingual reviews are not shown. Optional review profile links use `TRIPADVISOR_REVIEWS_URL` and `GOOGLE_BUSINESS_REVIEWS_URL`, and must be HTTPS.

Inquiry forms for private events, gift voucher requests, and partners are stored in the admin-only `inquiries` inbox. They fail closed unless `PUBLIC_FORM_RATE_LIMIT_SECRET` (at least 32 characters) and Cloudflare's `cf-connecting-ip` header are available. Blog guides are inserted as unpublished drafts, and public FAQ/article routes read only published database rows.

## Environment Variables

See `.env.example` for all configurable environment variables, including:

- `VITE_SITE_URL`: The canonical public URL (e.g. `https://moroccansecrets.com`)
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase anon/publishable key
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side administrative key
- `CRON_SECRET`: Secret token for scheduled server tasks
- `OWNER_WHATSAPP_NUMBER`: Direct WhatsApp contact for reservations
- `PUBLIC_CONTACT_EMAIL`: Optional public email link (hidden when empty)
- `INSTAGRAM_URL`: Optional HTTPS Instagram profile link (hidden when empty)
- `TRIPADVISOR_REVIEWS_URL`: Optional HTTPS link to the business review profile
- `GOOGLE_BUSINESS_REVIEWS_URL`: Optional HTTPS link to the Google Business review profile

## License

Private / All rights reserved.
