# Register Book — independent source project

This is a newly recreated source-code project for Register Book. It is **not an export of the earlier `chatgpt.site` page**. It provides an independent React website foundation intended for GitHub + Vercel + Supabase.

## What is included in this first source package

- Independent public Register Book landing page.
- School application and sign-in screens.
- Platform-owner school application review and approval foundation.
- School workspace shell and initial student record creation/listing.
- Supabase SQL foundation for separate school records and row-level security.
- Responsive design and reduced-motion support.

## Important: what is not finished yet

This is the first deployable foundation, **not a complete production school-management system**. Teacher invitations, teacher-specific class/period permissions, complete timetable management, period-wise attendance entry and correction audit logs, reports/export, photo storage/viewer, offline sync, and full security testing still need implementation and testing before real schools use it.

Do not upload real student information until the remaining modules and privacy/security review are complete.

## Requirements

- Node.js 20 or newer
- A GitHub account
- A Vercel account
- A Supabase account

## Run locally on Windows

1. Extract the ZIP.
2. Open the extracted `register-book-source` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

   ```bash
   npm install
   ```

5. Copy `.env.example` to a new file named `.env.local`.
6. Create a Supabase project and copy its Project URL and anon/publishable key into `.env.local`:

   ```env
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

7. In Supabase → SQL Editor, run the complete contents of `supabase/schema.sql`.
8. Start the website:

   ```bash
   npm run dev
   ```

9. Open the local address printed in the terminal, usually `http://localhost:5173`.

## Set up the first platform owner

1. Register your own account through the website.
2. In Supabase → SQL Editor, run this command after replacing the email:

   ```sql
   update public.profiles
   set role = 'platform_owner'
   where id = (
     select id from auth.users
     where email = 'YOUR-EMAIL-ADDRESS'
   );
   ```

3. Sign out and sign in again. The account should open the platform-owner console.

Never share your password, Supabase service-role key, or private credentials with anyone. The service-role key must never be placed in a `VITE_` browser environment variable.

## Publish with GitHub and Vercel

1. Create a **Public** GitHub repository named `register-book`.
2. Upload the project files and folders from this extracted directory. Do not upload `.env.local`.
3. In Vercel, choose **Add New → Project**, import the GitHub repository.
4. Use the Vite defaults:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. In Vercel → Project Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy.

Vercel will give the site a new address similar to `https://register-book-yourname.vercel.app` (the exact available name may differ).

## Security notes

- The browser must use only the Supabase anon/publishable key.
- Never expose the Supabase service-role key.
- Keep student records and photographs private.
- Review and test every Row Level Security policy before real deployment.
- The initial SQL is a foundation and needs a professional security review before handling real school/child data.
