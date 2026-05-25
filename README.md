# Vietnam Travel Platform

Next.js App Router MVP for a Vietnam travel marketplace with Supabase PostgreSQL/Auth/Storage/RLS, Mapbox maps, role-based dashboards, admin pages, forms, SEO metadata, and seed data.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui style components
- Supabase PostgreSQL, Auth, Storage, RLS
- Mapbox GL JS
- React Hook Form + Zod
- lucide-react

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env values:

```bash
cp .env.example .env.local
```

3. Fill Supabase and Mapbox values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

4. Apply database migration and seed:

```bash
supabase db push
supabase db seed
```

5. Run the app:

```bash
npm run dev
```

## Implemented MVP Scope

- Full Supabase schema for the requested 33 tables.
- RLS helper functions: `current_user_role()`, `is_admin()`, `is_super_admin()`.
- Public read policies, own-data policies, guide/merchant policies, admin policies, and super-admin role escalation guard.
- Storage buckets: `avatars`, `tours`, `restaurants`, `guides`, `attractions`, `blog`, `documents`, `ads`.
- Public routes, auth routes, user dashboard, guide dashboard, merchant dashboard, and admin route structure.
- Shared layout, card, form, map, admin, and UX components.
- Server actions for auth, content, marketplace, bookings, favorites, trip lists, AI plan mock, custom trip, ads, blog, and admin stats.
- REST-style API routes for destinations, tours, restaurants, attractions, guides, blog, bookings, favorites, trip lists, AI trip plans, ads, restaurant claims, custom trip requests, and admin stats.
- Admin moderation API routes for users, guide approval/rejection/suspension, restaurant claim approval/rejection, payments, SEO pages, translations, guide services, and guide availability.
- Admin forms for tours, restaurants, attractions, blog posts, ads, SEO pages, guide applications, and guide services now submit through API routes with React Hook Form + Zod validation.
- Admin list row actions for publishing/drafting/deleting content, guide moderation, restaurant claim moderation, user blocking, booking status updates, payment reconciliation, ad activation/pausing, and blog publishing/archiving.
- Supabase-backed public data query layer with mock-data fallback when Supabase env vars are not configured.
- Supabase-backed admin data helpers with mock fallback for core Admin list pages and dashboard stats.
- User dashboard now reads bookings, favorites, trip lists, AI plans, and profile data from Supabase helpers.
- Guide dashboard now reads guide profile, services, availability, bookings, and reviews, with service and availability actions.
- Merchant dashboard now reads claimed restaurants, claim requests, ad campaigns, and ad analytics.
- AI trip planner now generates a mock itinerary, previews map points, and saves plans to `ai_trip_plans`.
- Public tour, restaurant, and attraction cards/details can add items to a user's trip list.
- Storage upload API supports authenticated uploads to configured Supabase buckets and returns public URLs for form payloads.
- Public listing filters now affect tours, food map restaurants, attractions, and guides.
- Users can submit reviews for tours, restaurants, attractions, and guides; Admin can publish, hide, or delete reviews.
- Sitemap and robots routes are generated with public destinations, tours, restaurants, attractions, and blog URLs.
- Admin settings persist to `site_settings`; bookings can be exported as CSV.
- User dashboard now includes support ticket creation and ticket listing.
- Admin destination CRUD is available with publish/draft/edit/delete actions.
- Database migration includes common query indexes and `updated_at` triggers for users and tours.
- MapCoordinatePicker supports address geocoding, draggable marker, map click selection, and manual coordinate input.
- Opening hours, price table, and itinerary editors now support structured multi-field editing in admin forms.
- Tour create/update API now saves nested `tour_prices`, `tour_itinerary_days`, and `tour_inclusions` from TourForm.
- Restaurant create/update API now saves nested `restaurant_menu_items` and structured opening hours from RestaurantForm.
- Attraction create/update API now saves structured opening hours and filters payloads to valid table columns.
- Blog create/update API filters payloads to valid table columns and supports structured content blocks plus comma-separated tags.
- SEO pages API filters payloads and supports structured JSON-LD plus hreflang editing.
- Blog public listing supports category and tag filters.
- Custom trip proposals now have Admin create/list/status workflows and a user dashboard proposals view.
- Supabase Auth callback, email verification redirect, forgot password, and reset password flows are wired.
- Seed data for destinations, tours, restaurants, attractions, guides, blog posts, and reviews.

## Notes

The current pages use local mock data so the UI can render before Supabase credentials are configured. Server actions and migrations are ready for wiring live CRUD screens in the next phase.
