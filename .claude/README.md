# Claude Code — Global Distribution AS

## Hvem er vi
To-persons selskap (Daniel + Martin) som driver B2B-handel mellom europeiske sportsleverandører og asiatiske kjøpere. Claude fungerer som CTO-agent og gjør det meste av teknisk arbeid.

## Repoer
| Repo | Formål | URL |
|------|--------|-----|
| `aurora-trade-hub` | Monorepo: admin-portal + supplier-portal | github.com/g-dist/aurora-trade-hub |
| `jessica-buyer-portal` | Kjøper-portal (JessicaGD-branding) | github.com/g-dist/jessica-buyer-portal |

## Apps i dette monorepoet
| App | Rute | Brukere | Branding |
|-----|------|---------|---------|
| `apps/gdist` | `/admin/*` + `/supplier/*` | Daniel, Martin, leverandører | Global Distribution AS |
| `apps/buyer` | Eget repo (jessica-buyer-portal) | Asiatiske kjøpere | JessicaGD / Jessica |

## Stack
- React 18 + Vite + TypeScript
- Tailwind CSS + Radix UI (shadcn/ui-stil)
- TanStack Query v5
- React Router v6
- Supabase (auth + PostgreSQL + storage)
- Vercel (deploy)
- i18next (EN/NO/CN)

## Slik bruker vi Claude Code

### Starte en ny feature
1. Opprett feature-note i Obsidian (`06_Projects/`)
2. Åpne terminal i riktig app-mappe
3. Lim inn prompt fra `.claude/prompts/feature-impl.md`
4. Claude avklarer → designer → implementerer → oppdaterer docs
5. Review diff → merge PR

### Kjøre Claude
```bash
cd ~/projects/global-distribution/aurora-trade-hub
claude   # start interaktiv sesjon
```

### Branch-konvensjon
```
feat/kort-beskrivelse
fix/hva-som-er-feil
ops/infra-eller-deploy
```

### Commit-stil
```
feat: legg til ordrestatus-filter
fix: riktig valuta i faktura
ops: koble supabase til buyer-portal
```

## Viktige filer
| Fil | Innhold |
|-----|---------|
| `.claude/README.md` | Denne filen |
| `.claude/prompts/` | Gjenbrukbare prompt-maler |
| `docs/supabase.md` | DB-skjema, RLS, vanlige queries |
| `docs/vercel.md` | Deploy-oppsett, env-vars, prosjekter |
| `infra/scripts/` | Ops-scripts (sync, rapport, deploy) |

## Kontakt
- Daniel: admin-tilgang alle systemer
- Martin: admin-tilgang alle systemer
- Obsidian vault: `~/Documents/GlobalDistribution/`
