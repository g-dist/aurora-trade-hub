# Vercel — Deploy-oppsett

_Oppdatert: 2026-03-16_

## Prosjekter

| Prosjekt | App | Repo | URL |
|----------|-----|------|-----|
| `web-platform` | apps/gdist | g-dist/aurora-trade-hub | _(se Vercel dashboard)_ |

## Første gang (én manuell operasjon)

```bash
# 1. Logg inn med GitHub (g-dist)
vercel login

# 2. Link lokalt repo til eksisterende Vercel-prosjekt
cd ~/projects/global-distribution/aurora-trade-hub
vercel link
# Scope: g-dist
# Link to existing: Yes
# Project: web-platform

# 3. Legg til env-vars
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
# (lim inn verdiene fra .env.local)

# 4. Trigger redeploy
vercel --prod
```

## Daglig bruk

```bash
# Preview deploy
vercel

# Produksjon
vercel --prod

# Status
vercel ls
vercel inspect [url]

# Logs
vercel logs [url]

# Env-vars
vercel env ls
vercel env add KEY production
vercel env rm KEY production
```

## Build-konfig (vercel.json)

```json
{
  "buildCommand": "npm run build:gdist",
  "outputDirectory": "apps/gdist/dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

## GitHub-integrasjon

- Push til `main` → auto produksjon-deploy
- Push til andre branches → auto preview deploy
- PR-er får preview-lenke som kommentar
