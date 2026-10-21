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
- Guest photos use a separate private `guest-photos` storage bucket. The public gallery serves short-lived signed URLs only for rows whose guest consent is confirmed; seed records remain unapproved until consent is checked in `/admin`.
- After applying `20261031000000_guest_photo_consent.sql`, place the numbered `1.jpeg`, `2.jpeg`, … source files in the repository root and run `npm run seed:guest-photos`. The script creates metadata-stripped WebP renditions, skips files already seeded, and leaves all consent flags unchecked. Keep the source files out of commits.

## Booking Configuration

The booking flow displays only published Supabase experiences and explicit future availability rows. It does not invent open dates or accept bookings without an availability row, a configured ISO currency, and reviewed cancellation text in English, French, and Arabic. Requests are saved as pending bookings; no payment is collected.

Configure `BOOKING_CURRENCY`, `BOOKING_RATE_LIMIT_SECRET`, and `CANCELLATION_POLICY_EN`, `CANCELLATION_POLICY_FR`, and `CANCELLATION_POLICY_AR` in the deployment environment. The server rate limit uses Cloudflare's connecting-IP header and a database counter; booking requests fail closed if its secret or client IP is missing. Apply the Supabase migration before enabling the flow.

Trust information (included items, practical details, family-home explanation, and safety/hygiene text) is stored as multilingual records in `site_settings`. Public sections remain hidden until all EN/FR/AR text is saved and marked public. Approved reviews are loaded from the `reviews` table; unapproved and incomplete multilingual reviews are not shown. Optional review profile links use `TRIPADVISOR_REVIEWS_URL` and `GOOGLE_BUSINESS_REVIEWS_URL`, and must be HTTPS.

Inquiry forms for private events, gift voucher requests, and partners are stored in the admin-only `inquiries` inbox. They fail closed unless `PUBLIC_FORM_RATE_LIMIT_SECRET` (at least 32 characters) and Cloudflare's `cf-connecting-ip` header are available. Blog guides are inserted as unpublished drafts, and public FAQ/article routes read only published database rows.

## Admin Console

After applying all Supabase migrations, create administrator accounts in Supabase Auth and add their user IDs to `public.admin_users` using a trusted SQL session (never from the browser). For example, after creating the account in Auth:

```sql
INSERT INTO public.admin_users (id, email, role)
SELECT id, email, 'superadmin'
FROM auth.users
WHERE email = 'your-admin-email@example.com';
```

Sign in at `/admin` with that Auth account. The console checks `public.is_admin()` and performs reads and writes through the authenticated Supabase client under the existing RLS rules; it does not expose the service-role key. It supports booking operations and CSV export, internal notes and communication logs, a month availability calendar, experiences, consent-gated guest photos, editable homepage text, FAQ content, inquiries, and newsletter requests. Rare settings and moderation tools are under Advanced. Booking currency and cancellation-policy settings in `site_settings` take precedence over the documented environment fallbacks.

The public home page is the main journey. Its hero, idea, reasons, and steps are managed by public `home.hero`, `home.idea`, `home.reasons`, and `home.steps` settings; unfilled text sections remain hidden. French and Arabic fields may be left blank and fall back to English.

## Booking Email Delivery

Apply the booking email outbox migration. Booking receipts, status changes, 48-hour reminders, and post-visit review requests are queued transactionally and processed by `POST /api/cron/emails` with `Authorization: Bearer $CRON_SECRET`. Schedule that endpoint with a trusted cron service; do not expose the secret in client code. When `RESEND_API_KEY` is empty, the worker records a log-only delivery state and logs a masked recipient and subject without storing/rendering message content in logs. To send reviews with signed booking-only links, configure `REVIEW_TOKEN_SECRET` with at least 32 random characters. Guest reviews are stored unapproved and only appear after admin approval; each booking can submit at most one review.

## SEO, Analytics, and Newsletter

The sitemap is served dynamically from `/sitemap.xml` and includes public pages and published articles in English, French, and Arabic. Language versions use `?lang=` URLs; canonical and alternate-language links are emitted with page metadata. Open Graph photos are selected by page, and structured data includes LocalBusiness, TouristTrip, BreadcrumbList, FAQPage, and Article entries. Newsletter requests are stored as pending in `public.subscribers`; only a valid confirmation link activates an address. Confirmation emails use Resend, and requests remain pending when delivery is log-only. Plausible analytics are disabled unless a visitor accepts optional analytics in the consent banner. Configure both `VITE_PLAUSIBLE_DOMAIN` and `VITE_PLAUSIBLE_SCRIPT_URL`; the configured HTTPS script is not loaded before consent. No third-party analytics runs on newsletter forms.

## Security and Launch Checks

The server adds a Content Security Policy, `X-Content-Type-Options`, and `Referrer-Policy` to all responses, plus HSTS on HTTPS requests. The CSP allows the configured Supabase endpoint, Google Fonts, and the optional analytics script origin. Booking and public form endpoints validate input with Zod, use honeypots where applicable, and apply database-backed rate limits; set `BOOKING_RATE_LIMIT_SECRET` and `PUBLIC_FORM_RATE_LIMIT_SECRET` to independent random secrets of at least 32 characters. Apply every migration before exposing forms. The project build and unit tests do not replace a production Lighthouse run or a manual screen-reader review. Legal page copy is explicitly draft material and must be reviewed by a qualified professional before launch.

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
- `REVIEW_TOKEN_SECRET`: Required for signed guest review links; at least 32 random characters
- `VITE_PLAUSIBLE_DOMAIN`: Optional Plausible site domain, loaded only after analytics consent
- `VITE_PLAUSIBLE_SCRIPT_URL`: Optional HTTPS Plausible-compatible script URL, loaded only after consent

Additional server variables documented in `.env.example` include `BOOKING_CURRENCY`, `BOOKING_RATE_LIMIT_SECRET`, the three `CANCELLATION_POLICY_*` values, `PUBLIC_FORM_RATE_LIMIT_SECRET`, `RESEND_API_KEY`, `NOTIFICATION_EMAIL_TO`, `NOTIFICATION_EMAIL_FROM`, `CRON_SECRET_PREVIOUS`, the server-side Supabase URL/key/project ID, and `APP_URL` for local development.

## License

Private / All rights reserved.
