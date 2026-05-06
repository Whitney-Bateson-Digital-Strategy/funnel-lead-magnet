# Whitney's Read

A free interactive tool that gives dietitians, nutritionists, and private practice clinicians a personalized read on their lead magnet from Whitney Bateson, built on her teaching framework.

This is the production codebase. The tool lives at `read.whitneybateson.com` and feeds into the DFY Funnel email sequence in Kit.

---

## Quick start (local development)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then fill in real values for each variable. See SPEC.md for what each one is and where to find it.

### 3. Set up Supabase

In your Supabase project's SQL editor, run:

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

alter table reads enable row level security;
```

(No RLS policies are needed because we only access the table via the service role key, which bypasses RLS.)

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:4321`.

---

## Project structure

```
src/
├── pages/
│   ├── index.astro              Landing page (hello bar + ReadFlow)
│   ├── r/[id].astro             Stored Read viewer (server-rendered from Supabase)
│   └── api/
│       └── generate-read.ts     POST endpoint (AI call + DB write + Kit subscribe)
├── components/
│   ├── HelloBar.astro
│   ├── ReadFlow.jsx             The full opt-in + questions + result flow
│   └── ReadView.jsx             Renders a Read as a letter (used inline + on /r/[id])
├── lib/
│   ├── anthropic.ts             Anthropic API wrapper, parses + validates output
│   ├── supabase.ts              Supabase client + types
│   ├── kit.ts                   Kit (ConvertKit) subscription wrapper
│   └── prompt.ts                The system prompt (edit this to refine voice/framework)
└── styles/
    └── global.css               Brand tokens + utility classes
```

---

## Key flows

### When a user submits the questions

1. Browser POSTs to `/api/generate-read` with `{ name, email, answers }`
2. The API route validates the input
3. Calls Anthropic with the system prompt + user's answers
4. Validates the AI response shape
5. Writes a row to the `reads` table in Supabase
6. Subscribes the user to Kit with their unique `read_url` as a custom field
7. Returns the Read + URL to the browser
8. Browser shows the Read inline

If Kit is down, the request still succeeds (the Read is generated and stored). Kit failures are logged but don't break the flow.

### When a user visits `/r/[id]`

1. Astro server-renders the page
2. Looks up the Read by ID in Supabase
3. If not found, redirects to home
4. If found, renders the Read with their first_name and output

These pages are `noindex` so they don't end up in Google search results.

---

## Editing the AI prompt

The system prompt lives in `src/lib/prompt.ts`. This is where you tune:

- Whitney's voice rules
- The framework articulation
- The output structure
- The forbidden language patterns

After editing, test with several real lead magnet/offer combinations to verify the output quality. The prompt is the load-bearing piece of the entire tool — small wording changes can significantly shift output quality.

---

## Kit setup

In Kit, set up the following:

### A form

Name: "Whitney's Read Signup"
Custom field: `read_url` (text)

Take note of the form ID — it goes in `KIT_FORM_ID`.

### A sequence

Trigger: When someone subscribes to the "Whitney's Read Signup" form.

Emails:

1. **Email 1 (immediate)**: "Your read is ready"
   - Subject: "[name], here's your read"
   - Body: Link to `{{ subscriber.read_url }}` with a teaser line ("Click through for what I'm noticing about your funnel.")

2. **Email 2-7**: The DFY Funnel nurture sequence (write separately)
   - Each email can reference back to their Read with `{{ subscriber.read_url }}`
   - Build up to a soft, then stronger pitch for the DFY Funnel

---

## Deployment

### First deployment

1. Push this repo to GitHub
2. In Vercel, click "New Project" and import the repo
3. Set all environment variables from `.env.example` in the Vercel project settings
4. Deploy
5. Test with a real submission on the deployed URL
6. Set up the custom domain (`read.whitneybateson.com`) in Vercel project settings + your DNS provider

### Subsequent deployments

Push to the main branch. Vercel auto-deploys.

---

## Monitoring

Check these regularly:

- **Vercel logs**: Look for 500 errors on `/api/generate-read`
- **Anthropic console**: API usage, failed requests, spending
- **Supabase**: Row count in `reads` table tells you submissions
- **Kit**: Subscriber growth, email open rates

Set up Anthropic spending alerts so you don't get surprised.

---

## Cost expectations

Per 1,000 Reads, roughly:

- Anthropic API: ~$30
- Vercel: free tier handles this easily
- Supabase: free tier handles this easily

So a launch with 500 signups in month one is about $15 in incremental costs.

---

## Common issues

**"AI returned invalid JSON"**: The model occasionally adds a stray code fence or preamble. The wrapper strips ```json fences but not all variations. If you see this often, tighten the system prompt's "Output ONLY valid JSON" instruction or add a retry.

**"Kit subscribe failed"**: Logged but doesn't block the request. Check the Kit API key and form ID are correct. If using a v4 API key (newer accounts), the endpoint might differ slightly — check Kit docs.

**Slow Read generation**: Expect 15-30 seconds per call. If consistently over 45 seconds, check Anthropic dashboard for latency issues, or reduce `max_tokens` in `anthropic.ts`.

**Read URLs return 404**: The `/r/[id].astro` page requires `output: 'server'` in `astro.config.mjs`. If you see this, verify the config and redeploy.

---

## What's intentionally NOT in v1

- Rate limiting (add if abuse becomes an issue)
- Admin dashboard for viewing recent Reads
- Read-editing capability for Whitney to manually tweak outputs
- A/B testing of subject lines or copy
- Detailed analytics beyond Kit + Vercel basics

These can be added in v2 once you see what's actually needed.
