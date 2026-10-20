# Create the first admin account

1. In the Supabase Dashboard, open **Authentication → Users** and create the account using the email address you will use to sign in.
2. Copy the email address exactly as shown in the Users list.
3. Open **SQL Editor**, start a new query, replace `YOUR_AUTH_USER_EMAIL` with that email address, and run:

```sql
INSERT INTO public.admin_users (id, email, role)
SELECT id, email, 'superadmin'
FROM auth.users
WHERE email = 'YOUR_AUTH_USER_EMAIL'
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    role = 'superadmin';
```

The query uses the existing Auth user ID and assigns the first administrator the `superadmin` role. If no Auth user has the specified email, it inserts no row; verify the email in **Authentication → Users** before continuing.

4. Visit `/admin` on the deployed site and sign in with that Auth account.
5. Add further administrators through the admin console or by inserting their Auth user IDs into `public.admin_users` from the SQL Editor. Never expose the Supabase service-role key in the browser.
