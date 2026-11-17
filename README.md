Live preview http://giangisoft.altervista.org/portfolio/

# Portfolio

React 19 + TypeScript + Vite, with a password-protected admin dashboard (PHP API) to edit
texts, the profile picture and the site theme.

- Site: `/portfolio/`
- Admin dashboard: `/portfolio/admin/`

Content lives in `public/files/*.json` and is loaded at runtime, so edits made from the
dashboard show up immediately without a rebuild.

## Development

Requirements: Node 20+, Docker (for the local PHP API).

```bash
npm install
npm run api   # PHP 8.4 API on http://localhost:8787 (Docker)
npm run dev   # site on http://localhost:3000/portfolio/, admin on /portfolio/admin/
```

Vite proxies `/portfolio/api` to the PHP container. Locally the dashboard writes straight into
`public/files`, while the password hash is kept in a Docker volume (reset it with
`docker compose down -v`).

Other scripts: `npm run build` (typecheck + build into `build/`), `npm test`, `npm run typecheck`.

## Deploy (Altervista or any Apache + PHP >= 8.1 host)

1. `npm run build`
2. Upload the content of `build/` to the `portfolio` folder of the host.
3. Open `/portfolio/admin/` **right away** and choose the admin password: the first person to
   open the dashboard sets it, and it can be set only once.

> **Careful when redeploying:** `build/files/` contains the content from the repository.
> Uploading it overwrites what you edited online. Skip the `files` folder (or download it
> first) and never upload anything over `api/private/`.

The image upload limit is 5 MB; check that the host's `upload_max_filesize` and `post_max_size` allow it.

## Admin security

- The password is set once, from the first-access screen. The hash file is created atomically,
  so a second "first setup" is refused. Afterwards it can only be changed from
  *Sicurezza* (Security) by entering the current password.
- Only a salted hash is stored (**Argon2id**, or bcrypt cost 12 if PHP lacks Argon2), in
  `api/private/auth.php`. The folder is denied via `.htaccess`, and the file is PHP that
  prints nothing even if requested directly.
- Sessions: HttpOnly + SameSite=Strict cookies (Secure on HTTPS), id regenerated at login,
  30 min idle / 8 h absolute timeout. Every write requires a CSRF token.
- 5 wrong passwords from the same IP block logins for 15 minutes.
- All saved content is validated server-side (whitelisted documents, field types and lengths,
  hex-only colors, whitelisted fonts). Uploads must be real JPG/PNG/WEBP images and are always
  saved as `profile.<ext>`. Scripts can't run from `files/`.
- Use HTTPS for the admin dashboard, or the password travels in clear text.

**Forgot the password?** Delete `portfolio/api/private/auth.php` via FTP, then open the
dashboard and set a new one.
