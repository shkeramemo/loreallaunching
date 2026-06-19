# L'Oréalistar Launch Event Waiver

Digital event waiver app built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Add Supabase values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_SIGNATURES_BUCKET=signature-images
ADMIN_PASSWORD=change-me
```

4. Run `supabase/migrations/20260619000000_create_waiver_submissions.sql` in the Supabase SQL editor, or run `supabase/schema.sql` for the current full schema.

5. Start the app:

```bash
npm run dev
```

## Notes

- The API route uploads the signature PNG to the `signature-images` storage bucket and inserts the submission into `public.waiver_submissions`.
- The `/admin` page uses `ADMIN_PASSWORD` and lists waiver submissions with search, signature previews, total count, and CSV export.
- `SUPABASE_SERVICE_ROLE_KEY` is optional. Without it, inserts use the anon key and the included RLS policy.
- The generated event backdrop is stored at `public/event-backdrop.png`.
