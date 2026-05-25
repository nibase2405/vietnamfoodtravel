# Deployment Notes

## Production Domain

- Domain: `greenlinevn.com`
- Canonical URL: `https://greenlinevn.com`
- Production runtime: Next.js Node server behind RunCloud Nginx proxy.

This project is not a static export. It uses API routes, middleware/proxy, Supabase auth, dynamic pages, and server rendering, so RunCloud must run it as a Node.js process.

## Required Environment Variables

- `NEXT_PUBLIC_SITE_URL=https://greenlinevn.com`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

Optional:

- `NEXT_TELEMETRY_DISABLED=1`

## Supabase Redirect URLs

Configure these URLs in Supabase Auth:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/reset-password`
- `https://greenlinevn.com/auth/callback`
- `https://greenlinevn.com/reset-password`

## Database Setup

Run migrations and seed data:

```bash
supabase db push
supabase db seed
```

## Local Development

```bash
npm install
npm run verify
npm run typecheck
npm run build
npm run dev
```

## RunCloud Deployment

### Runtime

- Node.js: `>=20.9.0`
- Package manager: `pnpm@11.0.8`
- Build command: `pnpm run build`
- Start process: `pm2 startOrReload ecosystem.config.cjs --update-env`
- Node app port: `3000`

### RunCloud Atomic Deployment Script

Use these commands after RunCloud clones the release and before activating the release:

```bash
cd {RELEASEPATH}
corepack enable
pnpm install --frozen-lockfile
pnpm run build
```

Use this command after activating the release:

```bash
cd {RELEASEPATH}
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
```

### RunCloud Nginx Proxy

For Native Nginx, add a `location.root` config that proxies `greenlinevn.com` to the Next.js process:

```nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header Host $http_host;
proxy_pass http://127.0.0.1:3000;
```

### GitHub Webhook

If RunCloud Atomic Deployment is connected to GitHub, paste the RunCloud webhook URL into the GitHub repository webhook settings. Pushes to the configured production branch will trigger deployment.

## Mapbox

`NEXT_PUBLIC_MAPBOX_TOKEN` is required for:

- public food/attraction/tour maps
- Admin coordinate picker
- AI trip planner map preview

Without the token, map components render a non-breaking placeholder.
