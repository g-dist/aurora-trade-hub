#!/usr/bin/env bash
# =============================================================
# Global Distribution AS — Leverandør-onboarding pipeline
# Bruk: ./onboard-supplier.sh
#        ./onboard-supplier.sh --dry-run   (tester uten å skrive)
# =============================================================
set -euo pipefail

DRY_RUN=false
for arg in "$@"; do
  [[ "$arg" == "--dry-run" ]] && DRY_RUN=true
done

# ── Farger ──────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# ── Config ───────────────────────────────────────────────────
OBSIDIAN_VAULT="$HOME/Documents/GlobalDistribution"
SUPPLIER_DIR="$OBSIDIAN_VAULT/02_Suppliers/Active"
LOG_DIR="$OBSIDIAN_VAULT/10_Log"
OUTPUT_DIR="$OBSIDIAN_VAULT/02_Suppliers/Active"

# Last inn env-tokens
# shellcheck disable=SC1090
[[ -f "$HOME/.claude-env" ]] && source "$HOME/.claude-env"

SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_KEY="${SUPABASE_SERVICE_ROLE:-}"

if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_KEY" ]]; then
  echo -e "${RED}FEIL: SUPABASE_URL eller SUPABASE_SERVICE_ROLE mangler i ~/.claude-env${NC}"
  exit 1
fi

# ── Hjelpefunksjoner ─────────────────────────────────────────
step()  { echo -e "\n${CYAN}${BOLD}▶ $1${NC}"; }
ok()    { echo -e "  ${GREEN}✓${NC} $1"; }
warn()  { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail()  { echo -e "  ${RED}✗ $1${NC}"; exit 1; }

ask() {
  local prompt="$1" default="${2:-}" var
  if [[ -n "$default" ]]; then
    read -rp "  ${BOLD}${prompt}${NC} [${default}]: " var
    echo "${var:-$default}"
  else
    read -rp "  ${BOLD}${prompt}${NC}: " var
    echo "$var"
  fi
}

supabase_post() {
  local table="$1" payload="$2"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY-RUN] POST /${table}: $payload" >&2
    echo '[{"id":"dry-run-id-0000"}]'
    return 0
  fi
  curl -sf -X POST \
    "${SUPABASE_URL}/rest/v1/${table}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$payload"
}

slug() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | \
    sed 's/[æå]/a/g; s/ø/o/g; s/ /_/g; s/[^a-z0-9_-]//g'
}

today() { date +%Y-%m-%d; }
in30()  { date -v+30d +%Y-%m-%d 2>/dev/null || date -d "+30 days" +%Y-%m-%d; }

# ── Kategorier ───────────────────────────────────────────────
CATEGORIES=(
  "Klær - Dame"
  "Klær - Herre"
  "Klær - Barn"
  "Sko"
  "Vesker og accessories"
  "Smykker"
  "Sportsutstyr"
  "Elektronikk"
  "Hjemmetekstil"
  "Annet"
)

show_categories() {
  echo -e "\n  ${BOLD}Tilgjengelige kategorier:${NC}"
  for i in "${!CATEGORIES[@]}"; do
    echo "  $((i+1)). ${CATEGORIES[$i]}"
  done
}

pick_category() {
  show_categories
  local choice
  read -rp "  Velg nummer (1-${#CATEGORIES[@]}): " choice
  if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= ${#CATEGORIES[@]} )); then
    echo "${CATEGORIES[$((choice-1))]}"
  else
    echo "Annet"
  fi
}

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

echo -e "\n${BOLD}${BLUE}╔══════════════════════════════════════════════╗"
echo -e "║   Global Distribution — Leverandør-onboarding  ║"
echo -e "╚══════════════════════════════════════════════╝${NC}"
echo -e "  Mål: ny leverandør live på plattformen på under 30 min\n"

# ── Steg 1: Samle inn info ───────────────────────────────────
step "1/5 · Leverandørinformasjon"

NAME=$(ask "Leverandørnavn (firma)" "")
[[ -z "$NAME" ]] && fail "Leverandørnavn er påkrevd"

CONTACT=$(ask "Kontaktperson")
EMAIL=$(ask "E-post")
PHONE=$(ask "Telefon / WhatsApp")
COUNTRY=$(ask "Land" "CN")
LOCATION=$(ask "By / region" "")
PAYMENT=$(ask "Betalingsbetingelser" "Net 30")
CURRENCY=$(ask "Valuta" "CNY")
NOTES=$(ask "Notater / merknad" "")

ok "Info registrert for: $NAME"

# ── Steg 2: Produkter ────────────────────────────────────────
step "2/5 · Produkter"
echo -e "  Legg til produkter for ${BOLD}$NAME${NC}"
echo -e "  (Trykk Enter uten navn for å avslutte)\n"

declare -a PRODUCTS
declare -a PROD_NAMES
declare -a PROD_CATS
declare -a PROD_PRICES
declare -a PROD_BRANDS
declare -a PROD_SKUS

prod_idx=0
SUPPLIER_SLUG=$(slug "$NAME")

while true; do
  read -rp "  Produktnavn (eller Enter for å avslutte): " pname
  [[ -z "$pname" ]] && break

  pbrand=$(ask "  Merkevare/brand" "$NAME")
  pcat=$(pick_category)
  pprice=$(ask "  Innpris NOK" "0")
  psku="${SUPPLIER_SLUG}_$(printf '%03d' $((prod_idx+1)))"
  psku_input=$(ask "  SKU" "$psku")

  PROD_NAMES+=("$pname")
  PROD_CATS+=("$pcat")
  PROD_PRICES+=("$pprice")
  PROD_BRANDS+=("$pbrand")
  PROD_SKUS+=("${psku_input:-$psku}")

  prod_idx=$((prod_idx + 1))
  ok "Produkt $prod_idx lagt til: $pname ($pcat)"
done

ok "$prod_idx produkt(er) klare"

# ── Steg 3: Opprett Obsidian-fil ─────────────────────────────
step "3/5 · Oppretter Obsidian-leverandørfil"

FILENAME="${SUPPLIER_DIR}/$(today)_$(slug "$NAME").md"
mkdir -p "$SUPPLIER_DIR"

# Bygg produkttabell for Obsidian
PROD_TABLE="| Produkt | Kategori | Pris (NOK) | SKU |
|---------|----------|------------|-----|"
for i in "${!PROD_NAMES[@]}"; do
  PROD_TABLE="${PROD_TABLE}
| ${PROD_NAMES[$i]} | ${PROD_CATS[$i]} | ${PROD_PRICES[$i]} | ${PROD_SKUS[$i]} |"
done
[[ $prod_idx -eq 0 ]] && PROD_TABLE="${PROD_TABLE}
|  |  |  |  |"

cat > "$FILENAME" << EOF
# Leverandør: ${NAME}

**Status:** Aktiv
**Lagt til:** $(today)
**Onboardet:** $(today)

---

## Kontaktinfo

**Kontaktperson:** ${CONTACT}
**E-post:** ${EMAIL}
**Telefon:** ${PHONE}
**Land:** ${COUNTRY}
**Sted:** ${LOCATION}
**Valuta:** ${CURRENCY}

---

## Produkter

${PROD_TABLE}

→ Se [[03_Products/Catalogue]] for full produktliste

---

## Betalingsbetingelser

**Betalingsbetingelser:** ${PAYMENT}
**Valuta:** ${CURRENCY}

---

## Ordre

| Ordrenr | Dato | Status | Beløp |
|---------|------|--------|-------|
|         |      |        |       |

---

## Notater

${NOTES:-_Ingen notater ennå_}

---

## Oppfølging

- [ ] 📅 Oppfølging planlagt: $(in30) — 30 dager etter onboarding
- [ ] Velkomstepost sendt (NO)
- [ ] Welcome email sent (EN)
- [ ] Produkter verifisert i plattformen

---

## Historikk

| Dato | Hendelse |
|------|----------|
| $(today) | Leverandør opprettet via onboarding-pipeline |
EOF

ok "Obsidian-fil opprettet: $FILENAME"

# ── Steg 4: Supabase ─────────────────────────────────────────
step "4/5 · Oppretter i Supabase"

# 4a. Opprett leverandør
SUPPLIER_PAYLOAD=$(python3 -c "
import json, sys
d = {
  'name': sys.argv[1],
  'contact_name': sys.argv[2],
  'email': sys.argv[3],
  'phone': sys.argv[4],
  'country': sys.argv[5],
  'location': sys.argv[6],
  'payment_terms': sys.argv[7],
  'notes': sys.argv[8],
  'active': True
}
print(json.dumps(d))
" "$NAME" "$CONTACT" "$EMAIL" "$PHONE" "$COUNTRY" "$LOCATION" "$PAYMENT" "$NOTES")

SUPPLIER_RESP=$(supabase_post "suppliers" "$SUPPLIER_PAYLOAD") || fail "Kunne ikke opprette leverandør i Supabase"
SUPPLIER_ID=$(echo "$SUPPLIER_RESP" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['id'] if isinstance(d,list) else d['id'])" 2>/dev/null || echo "")

if [[ -z "$SUPPLIER_ID" ]]; then
  warn "Fikk ikke supplier_id fra Supabase — sjekk manuelt"
  SUPPLIER_ID="MANUELL"
else
  ok "Leverandør i Supabase: $SUPPLIER_ID"
fi

# 4b. Opprett produkter
if [[ $prod_idx -gt 0 ]]; then
  for i in "${!PROD_NAMES[@]}"; do
    PROD_PAYLOAD=$(python3 -c "
import json, sys
d = {
  'name': sys.argv[1],
  'brand': sys.argv[2],
  'category': sys.argv[3],
  'supplier_price_nok': float(sys.argv[4]) if sys.argv[4] != '0' else None,
  'sku': sys.argv[5],
  'supplier_id': sys.argv[6],
  'status': 'active',
  'stock_status': 'out_of_stock',
  'stock_quantity': 0
}
d = {k: v for k, v in d.items() if v is not None}
print(json.dumps(d))
" "${PROD_NAMES[$i]}" "${PROD_BRANDS[$i]}" "${PROD_CATS[$i]}" "${PROD_PRICES[$i]}" "${PROD_SKUS[$i]}" "$SUPPLIER_ID")

    PROD_RESP=$(supabase_post "products" "$PROD_PAYLOAD") || warn "Produkt ${PROD_NAMES[$i]} feilet"
    PROD_ID=$(echo "$PROD_RESP" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['id'] if isinstance(d,list) else d['id'])" 2>/dev/null || echo "feil")
    ok "Produkt: ${PROD_NAMES[$i]} → $PROD_ID"
  done
fi

# Oppdater Obsidian-fil med supplier_id
if [[ "$SUPPLIER_ID" != "MANUELL" ]]; then
  sed -i '' "s|Leverandør opprettet via onboarding-pipeline|Leverandør opprettet via onboarding-pipeline (Supabase ID: $SUPPLIER_ID)|" "$FILENAME" 2>/dev/null || true
fi

# ── Steg 5: Velkomstemailer ──────────────────────────────────
step "5/5 · Genererer velkomstemailer"

EMAIL_DIR="$OBSIDIAN_VAULT/02_Suppliers/Active"
EMAIL_NO="${EMAIL_DIR}/$(today)_$(slug "$NAME")_velkomst_NO.md"
EMAIL_EN="${EMAIL_DIR}/$(today)_$(slug "$NAME")_welcome_EN.md"

# Norsk e-post
cat > "$EMAIL_NO" << EOF
# Velkomstepost — ${NAME} (Norsk)

**Til:** ${EMAIL}
**Fra:** post@gdist.no
**Emne:** Velkommen som leverandørpartner hos Global Distribution AS

---

Hei ${CONTACT},

Vi er glade for å ønske dere velkommen som leverandørpartner hos **Global Distribution AS**!

Vi ser frem til et godt og langsiktig samarbeid med ${NAME}. Nedenfor finner dere praktisk informasjon for oppstarten av vårt samarbeid.

## Våre kontaktdetaljer

**Global Distribution AS**
E-post: post@gdist.no
Plattform: [gdist.no](https://gdist.no)

## Betalingsbetingelser

Vi har avtalt følgende betalingsbetingelser: **${PAYMENT}** i **${CURRENCY}**.

## Neste steg

1. Bekreft at dere har mottatt denne e-posten
2. Send oss oppdatert produktkatalog og prisliste
3. Vi setter opp produktene i vår plattform
4. Første ordre forventes innen kort tid

Vi tar kontakt igjen innen 30 dager for en oppfølgingssamtale.

Ikke nøl med å ta kontakt dersom dere har spørsmål.

Med vennlig hilsen,

**Global Distribution AS**
post@gdist.no

---
_Generert: $(today) · Supabase ID: ${SUPPLIER_ID}_
EOF

# Engelsk e-post
cat > "$EMAIL_EN" << EOF
# Welcome Email — ${NAME} (English)

**To:** ${EMAIL}
**From:** post@gdist.no
**Subject:** Welcome as a Supplier Partner with Global Distribution AS

---

Dear ${CONTACT},

We are pleased to welcome **${NAME}** as a new supplier partner with **Global Distribution AS**!

We look forward to a strong and long-lasting partnership. Below you will find important information to get started.

## Our Contact Details

**Global Distribution AS**
Email: post@gdist.no
Platform: [gdist.no](https://gdist.no)

## Payment Terms

We have agreed on the following payment terms: **${PAYMENT}** in **${CURRENCY}**.

## Next Steps

1. Please confirm receipt of this email
2. Send us your updated product catalogue and price list
3. We will set up your products on our platform
4. We expect to place our first order shortly

We will follow up with you within 30 days to check in.

Please don't hesitate to reach out if you have any questions.

Best regards,

**Global Distribution AS**
post@gdist.no

---
_Generated: $(today) · Supabase ID: ${SUPPLIER_ID}_
EOF

ok "Norsk velkomstepost: $EMAIL_NO"
ok "English welcome email: $EMAIL_EN"

# ── Oppfølgingspåminnelse ────────────────────────────────────
step "Setter 30-dagers oppfølgingspåminnelse"

REMINDER_DATE=$(in30)
REMINDER_FILE="$LOG_DIR/$(today)_reminder_$(slug "$NAME").md"
mkdir -p "$LOG_DIR"

cat > "$REMINDER_FILE" << EOF
# Påminnelse: Oppfølging ${NAME}

**Dato for oppfølging:** ${REMINDER_DATE}
**Leverandør:** ${NAME}
**Kontakt:** ${CONTACT} — ${EMAIL}
**Supabase ID:** ${SUPPLIER_ID}

## Sjekkliste for oppfølging

- [ ] Ta kontakt med ${CONTACT}
- [ ] Verifiser at produktene er korrekt registrert i plattformen
- [ ] Bekreft priser og tilgjengelighet
- [ ] Planlegg første ordre hvis ikke allerede gjort
- [ ] Oppdater status i Obsidian-leverandørfil

## Lenker

- Leverandørfil: [[02_Suppliers/Active/$(today)_$(slug "$NAME")]]
- Supabase: https://supabase.com/dashboard/project/orsjlztclkiqntxznnyo/editor

---
_Opprettet automatisk av onboarding-pipeline $(today)_
EOF

# macOS kalender-påminnelse (valgfritt — feiler stille hvis ikke tilgjengelig)
osascript -e "
tell application \"Calendar\"
  tell calendar \"Arbeid\"
    make new event with properties {summary:\"Oppfølging leverandør: ${NAME}\", start date:date \"${REMINDER_DATE} 09:00:00\", end date:date \"${REMINDER_DATE} 09:30:00\", description:\"30-dagers oppfølging. Supabase ID: ${SUPPLIER_ID}. Kontakt: ${CONTACT} (${EMAIL})\"}
  end tell
end tell
" 2>/dev/null && ok "Kalenderoppføring opprettet: $REMINDER_DATE" || warn "Kalender-påminnelse ikke satt (kjør manuelt om ønskelig)"

ok "Påminnelsesfil: $REMINDER_FILE"

# ── Oppsummering ─────────────────────────────────────────────
echo -e "\n${GREEN}${BOLD}════════════════════════════════════════════"
echo -e "  ✅  ${NAME} er live på plattformen!"
echo -e "════════════════════════════════════════════${NC}"
echo -e ""
echo -e "  ${BOLD}Supabase ID:${NC}     $SUPPLIER_ID"
echo -e "  ${BOLD}Produkter:${NC}       $prod_idx stk opprettet"
echo -e "  ${BOLD}Obsidian-fil:${NC}    $FILENAME"
echo -e "  ${BOLD}E-post NO:${NC}       $EMAIL_NO"
echo -e "  ${BOLD}E-post EN:${NC}       $EMAIL_EN"
echo -e "  ${BOLD}Oppfølging:${NC}      $REMINDER_DATE"
echo -e ""
echo -e "  ${YELLOW}Neste steg:${NC}"
echo -e "  1. Send velkomsteposten til ${EMAIL}"
echo -e "  2. Verifiser produktene på gdist.no/admin"
echo -e "  3. Oppfølging satt til ${REMINDER_DATE}"
echo -e ""
