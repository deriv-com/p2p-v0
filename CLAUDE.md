# CLAUDE.md — P2P Web

Web client for the Deriv P2P product. Next.js 15 App Router + React 19.

Cross-platform context (mobile counterpart, shared backend, feature parity rules) lives at `../CLAUDE.md`.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Runtime | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom tokens in `tailwind.config.ts` |
| UI primitives | Radix UI (shadcn-style wrappers in `components/ui/`) |
| Server state | `@tanstack/react-query` v5 |
| Client state | Zustand stores in `stores/` |
| Forms | react-hook-form + Zod |
| i18n | Custom `useTranslations` hook reading JSON files in `lib/i18n/translations/` |
| WebSocket | Context in `contexts/websocket-context.tsx` + `hooks/use-websocket*` |
| Analytics | `@deriv-com/analytics` (RudderStack wrappers) + Datadog RUM |
| Testing | Jest + `@testing-library/react` |
| Package manager | pnpm |
| Deploy | Cloudflare Pages via `next-on-pages` |

## Repository Structure

```
p2p-v0/
├── app/                    # App Router pages & route handlers
│   ├── page.tsx            # Markets (home)
│   ├── ads/                # My Ads
│   ├── advertiser/         # Advertiser profile
│   ├── orders/             # Orders
│   ├── profile/            # User profile
│   ├── wallet/             # Wallet & transfer
│   ├── login/              # Auth (Ory Kratos)
│   ├── api/                # Route handlers (proxy to Kratos etc.)
│   └── layout.tsx
├── components/             # Feature & shared components
│   ├── ui/                 # Radix primitives wrapped (Button, Alert, Dialog, ...)
│   ├── buy-sell/
│   ├── order-details/
│   ├── p2p-balance-warning/
│   └── ...
├── hooks/                  # Custom hooks (use-api-queries, use-websocket, ...)
├── stores/                 # Zustand stores
├── services/api/           # API client (Ory + P2P backend)
├── contexts/               # React contexts (websocket, alert dialog, ...)
├── lib/
│   ├── i18n/translations/  # 12 locale JSON files
│   └── utils.ts
├── analytics/              # Event tracking
├── public/icons/           # SVG/PNG assets
└── __tests__/              # Jest tests mirroring source tree
```

## Commands

```bash
pnpm install
pnpm dev           # http://localhost:3000
pnpm build         # Next.js build + Cloudflare adapter
pnpm lint          # next lint
pnpm test          # jest (if configured in scripts)
npx tsc --noEmit   # typecheck
```

## Key Patterns

### State split

- **Server state** → React Query via `hooks/use-api-queries.ts` (`useTotalBalance`, `usePaymentMethods`, `useAdvertisements`, etc.). 2-minute default staleTime for balance.
- **Client state** → Zustand stores (`useUserDataStore`, `useMarketFilterStore`, `useOrderSidebarStore`). Use selector functions to minimize re-renders.
- **Local UI state** → `useState` / `useReducer` in components.

### API layer

All API calls go through `services/api/`. Each file maps to a backend domain (`api-auth.ts`, `api-buy-sell.ts`, `api-chat.ts`, ...). React Query hooks wrap these in `hooks/use-api-queries.ts`.

### i18n

`useTranslations()` returns `{ t, locale }`. `t(key, params?)` resolves dotted keys (`"market.noBalanceTitle"`). EN is the fallback for missing keys in other locales. When adding a new string:

1. Add to `lib/i18n/translations/en.json` (required).
2. Add translated values to the other 11 locale files (`bn, de, es, fr, it, ko, pl, pt, ru, sw, vi`).
3. Never hardcode user-facing strings in components.

### UI components

- Use `components/ui/` Radix wrappers (Button, Alert, Dialog, Tabs, ...) — never use raw HTML buttons or custom modals when a primitive exists.
- Follow the `cva` variant pattern already in place for new primitives.
- Tailwind-first. Use design tokens from `tailwind.config.ts` (`bg-error-light`, `bg-slate-1200`, `text-grayscale-100`, ...) instead of hex literals.

### Icons

- SVG/PNG assets under `public/icons/`.
- For decorative icons, add `alt=""` + `aria-hidden="true"`.
- `lucide-react` is available for generic icons; project-branded icons live in `public/icons/`.

### WebSocket

- Single shared `WebSocketContext` wraps the whole app.
- Subscribe from a component via `useWebSocketContext()` — returns `subscribe`, `joinAdvertsChannel`, `subscribeToUserUpdates`, etc.
- Subscribe callbacks must filter on `data.options.channel` before reading payload.
- Channels: `users/me`, `adverts/currency/{currency}/{type}`, `users_online`.
- Event: `data.payload.data.event` (`balance_change`, `status_change`, `update`, ...).

### Auth (Ory Kratos)

- Login flow: `GET /self-service/login/api` → `POST /self-service/login?flow={flowId}`.
- Registration flow: `GET /self-service/registration/api` → `POST /self-service/registration?flow={flowId}`.
- OTP: submit with `method: 'code'` and the code.
- Session token passed via `X-Session-Token` header (see `services/api/api-auth.ts`).

### Routing

- App Router. `useRouter()` / `useSearchParams()` / `usePathname()` from `next/navigation`.
- Deep links use URL search params (e.g. wallet transfer deep link: `/wallet?operation=TRANSFER`, read by `app/wallet/components/wallet-summary.tsx`).
- `router.replace()` to clean URLs after consuming a deep-link param.

## Testing

- Tests live in `__tests__/` mirroring source paths (`__tests__/hooks/`, `__tests__/components/`, `__tests__/app/`).
- Mock `next/navigation` when testing nav behaviour.
- Mock `@/lib/i18n/use-translations` when testing components with `t()` calls — return a small key→string map.
- Use `renderHook` + `act` + fake timers when testing hooks with `setTimeout` / debouncing.
- Follow the `import jest from "jest"` convention already in the repo (there are outstanding tsc complaints about this across the repo; don't try to fix one-off).

## UI rules (critical)

- **NEVER** hardcode user-facing strings — always use `t("namespace.key")`.
- **NEVER** hardcode colors — use Tailwind tokens from `tailwind.config.ts`.
- **ALWAYS** use `components/ui/` primitives when one exists.
- **ALWAYS** add `aria-*` attributes on interactive controls; decorative icons get `alt=""` + `aria-hidden="true"`.
- **PREFER** server state in React Query over duplicating state in Zustand.

## Data source gotchas

See `../CLAUDE.md` for the full list. Web-specific ones:

- `userData?.balances?.amount` (from `/users/me`) = **P2P balance** — matches mobile's `myProfileProvider.totalAccountValue`. Use this for banner/gate logic.
- `useTotalBalance()` returns the wallet-service shape (`wallets.items[]`) — a DIFFERENT source. Don't use for P2P balance decisions; only use for displaying wallet breakdowns on the wallet page.
- WebSocket `balance_change` handler lives in `app/page.tsx` and `app/wallet/page.tsx` — updates local `balance` state AND `useUserDataStore.updateBalances`.

## Verification (run before PR)

```bash
npx tsc --noEmit   # typecheck
pnpm lint          # eslint
pnpm test          # jest (if wired into scripts)
```
