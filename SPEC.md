# Whitney's Read — Technical Spec

## Overview

A production deployment of the Whitney's Read tool. Astro + Supabase + Vercel + Kit. The visitor lands on the page, opts in with email, answers 8 questions, sees their Read inline, and receives an email with a link to revisit it.

---

## Stack

- **Framework**: Astro (with React islands for interactive parts)
- **Hosting**: Vercel (serverless functions for API routes)
- **Database**: Supabase (Postgres) — stores each Read by unique ID
- **Email**: Kit (formerly ConvertKit) — handles subscriber tagging and the nurture sequence
- **AI**: Anthropic API (Claude Sonnet 4)
- **Domain**: `read.whitneybateson.com` (subdomain of main site)

---

## Environment variables

Set these in Vercel's project settings (and locally in `.env`):

```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
KIT_API_KEY=...
KIT_FORM_ID=...
PUBLIC_SITE_URL=https://read.whitneybateson.com
```

Important notes:
- `SUPABASE_SERVICE_ROLE_KEY` (not the anon key) — needed for server-side writes
- `KIT_FORM_ID` is the form ID for the Whitney's Read sequence in Kit
- `PUBLIC_SITE_URL` is exposed to the client for generating share links

---

## Supabase schema

One table called `reads`:

```sql
create table reads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text not null,
  answers jsonb not null,
  output jsonb not null,
  created_at timestamptz default now()
);

create index reads_email_idx on reads(email);
create index reads_created_at_idx on reads(created_at desc);

-- RLS: only service role can read/write (we don't expose this table to the client)
alter table reads enable row level security;
```

The `id` becomes the URL slug. URL pattern: `read.whitneybateson.com/r/[id]`.

---

## API routes

### `POST /api/generate-read`

Called when the user finishes the 8 questions. Takes their answers, generates a Read with Claude, stores it in Supabase, tags them in Kit, returns the Read + the unique URL.

**Request body:**
```json
{
  "name": "string",
  "email": "string",
  "answers": {
    "leadMagnetTitle": "string",
    "leadMagnetTeaches": "string",
    "afterFeeling": "string",
    "paidOffer": "string",
    "offerType": "string",
    "transformation": "string",
    "currentlyAttracting": "string",
    "priceRange": "string"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "url": "https://read.whitneybateson.com/r/[id]",
  "output": { /* the AI-generated Read */ }
}
```

**Internal flow:**
1. Validate the request (email format, required fields)
2. Call Anthropic API with the system prompt + user's answers
3. Parse the JSON response
4. Insert into Supabase
5. Subscribe the user to Kit with the form/tag
6. Return the Read + URL

### `GET /r/[id]`

Loads a previously-generated Read by ID. Server-rendered Astro page (no client roundtrip). Returns the Read view with the user's name, opener, spectrum, thoughts, actions, etc.

---

## Kit integration

When a user submits, they get added to Kit via the API:

```
POST https://api.convertkit.com/v3/forms/[FORM_ID]/subscribe
{
  "api_key": "[KIT_API_KEY]",
  "email": "user@example.com",
  "first_name": "Sarah",
  "fields": {
    "read_url": "https://read.whitneybateson.com/r/[id]"
  }
}
```

The `read_url` custom field gets the unique link to their Read. In Kit, set up:

1. **A form** named "Whitney's Read Signup" with a custom field `read_url`
2. **A sequence** triggered by that form that:
   - Email 1 (immediate): "Your Read is ready" — subject + body links to {{ subscriber.read_url }}
   - Email 2 (day 2): "About that gap I mentioned..."
   - Email 3 (day 4): Case study from the DFY Funnel
   - Email 4 (day 7): The framework explained deeper
   - Email 5 (day 10): Soft pitch for the DFY Funnel
   - Email 6 (day 14): Stronger pitch + booking link
   - Email 7 (day 21): Final follow-up

Custom fields in Kit emails use `{{ subscriber.read_url }}` syntax.

---

## File structure

```
whitneys-read/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── .env (gitignored)
├── .env.example
├── public/
│   └── favicon.ico
├── src/
│   ├── pages/
│   │   ├── index.astro              # Landing page
│   │   ├── r/[id].astro             # View a stored Read
│   │   └── api/
│   │       └── generate-read.ts     # POST endpoint
│   ├── components/
│   │   ├── ReadFlow.jsx             # The full quiz + result component (React)
│   │   ├── LandingHero.astro        # Hero section
│   │   ├── HelloBar.astro           # Top hello bar
│   │   ├── ReadView.jsx             # Renders a Read (used inline + on /r/[id])
│   │   └── SpectrumVisual.jsx       # The cold-warm-hot spectrum
│   ├── lib/
│   │   ├── anthropic.ts             # Anthropic API wrapper
│   │   ├── supabase.ts              # Supabase client
│   │   ├── kit.ts                   # Kit API wrapper
│   │   └── prompt.ts                # The system prompt (large)
│   └── styles/
│       └── global.css               # Brand colors + global styles
└── README.md
```

---

## Deployment checklist

### Pre-deployment

1. Create Supabase project (or use existing WBDS Supabase)
2. Run the SQL from the schema section above in the SQL editor
3. Get the service role key from Supabase project settings
4. Get an Anthropic API key from console.anthropic.com (use a separate key for this project so you can monitor usage)
5. Set up Kit form + sequence (or use existing if there's a relevant one)
6. Get Kit API key + Form ID

### Deployment

1. Push the project to a GitHub repo
2. Import the repo in Vercel
3. Set environment variables in Vercel project settings (all six listed above)
4. Deploy
5. Test the live URL with a real submission
6. Set up the custom domain (`read.whitneybateson.com`) in Vercel + DNS

### Post-deployment testing

- [ ] Page loads on mobile + desktop
- [ ] Form validation works (can't submit empty)
- [ ] Submission generates a Read in under 30 seconds
- [ ] Read displays inline correctly
- [ ] Email arrives in inbox within 1 minute
- [ ] Email's "View your Read" link loads the correct Read at /r/[id]
- [ ] Kit shows the new subscriber tagged correctly
- [ ] Anthropic dashboard shows the API call

---

## Cost estimates

- **Vercel**: Free tier should handle this for a while. ~$20/mo if it grows.
- **Supabase**: Free tier (500MB database, 2GB bandwidth) handles thousands of Reads.
- **Anthropic**: Each Read is about 2,000-3,000 tokens of input + 1,500 tokens of output. With Claude Sonnet 4 pricing (~$3/M input, $15/M output), each Read costs roughly **$0.03**. Per 1,000 Reads, ~$30.
- **Kit**: Already paying for it, no incremental cost.

For a launch with 500 signups in the first month: ~$15 in Anthropic costs.

---

## Monitoring + maintenance

After launch, watch:

1. **Anthropic dashboard** for API usage and any failed requests
2. **Vercel logs** for any 500 errors on the API route
3. **Supabase logs** for failed inserts
4. **Kit dashboard** for subscriber growth + email open rates

Set up Anthropic API spending alerts at $50, $100, $200/mo so you don't get surprised by a viral moment.

---

## What's NOT in this build (yet)

Things to consider for v2:

- Rate limiting on the API route (in case of bot abuse)
- A simple admin dashboard to view recent Reads
- An "improve this Read" button if Whitney wants to manually tweak any output before it sends
- A/B testing the email subject lines
- Analytics beyond Kit (e.g., Plausible for landing page traffic)

These can be added later. Ship v1 first.
