# Cosmic Rush — Dev Status

## What's Done ✅
- Loading screen image fixed (uses `BASE_URL` prefix for CDN subdirectory)
- Mobile buy bonus PNG fixed (LayoutPortrait now renders BuyBonus.png overlay)
- Round restore on refresh (bet mode + amount both restored from RGS)
- Game rules re-trigger section + legal disclaimer added
- DevPanel removed (was overriding balance with mock data)
- Audio paths fixed (`bgmFiles.ts` + `Sound.svelte` now use `BASE_URL` prefix)
- i18n translations for 16 languages wired (all SDK UI text)
- `index.html` now generated correctly in build (`prerender = true` + `ssr = false`)
- Balance polling added (calls `/wallet/authenticate` every 5s)

---

## Outstanding Issue: Balance Shows as $0 on Stake Test Site

### What we know
- Game URL from Stake: `?sessionID=...&rgs_url=rgsd.stake-engine.com&lang=en&currency=USD&device=desktop&social=false&demo=true`
- `sessionID` and `rgs_url` params are correct — game reads these fine
- When user clicks Stake's "Add Balance" button, **iframe reloads with a new `sessionID`**
- After reload, `authenticate()` runs against `https://rgsd.stake-engine.com/wallet/authenticate`
- Balance still shows as $0 — user cannot spin

### Suspected cause
The game is running in **`demo=true` mode**. Two likely culprits:

**Theory A — Balance unit mismatch:**
Stake's schema says `"1000 = $10.00"` (100x multiplier), but our code divides by `1_000_000`.
If Stake's demo RGS returns e.g. `balance: { amount: 100000 }` meaning $1,000 (in their 100x system),
we'd calculate `100000 / 1000000 = $0.10` — way off, effectively shows as ~$0.

**Theory B — Authenticate is failing silently:**
There's an error at line 1317 in the bundle during initialization. If `authenticate()` throws
(e.g. CORS, network error, or Stake RGS returns an error status), the catch block fires but
the game still loads with `balanceAmount = 0` (default).

### Next step to diagnose
Add this temporary logging to `Authenticate.svelte` in the `authenticate()` function,
rebuild, and check the browser console on Stake's test site:

```js
const authenticate = async () => {
    try {
        const authenticateData = await requestAuthenticate({...});
        console.log('[AUTH RESPONSE]', JSON.stringify(authenticateData));  // ADD THIS
        ...
    } catch (error) {
        console.error('[AUTH ERROR]', error);  // MAKE THIS VISIBLE
        ...
    }
};
```

The console output will show:
- If `authenticateData.balance.amount` is a large number → unit mismatch (fix: divide by 100 not 1_000_000)
- If `authenticateData.balance.amount` is 0 → Stake's demo RGS returns 0 (Stake-side issue)
- If it throws → CORS or network error (check Network tab for the failed request)

### File to edit
`engines/web-sdk/packages/components-shared/src/components/Authenticate.svelte`
(also in `sdk-overrides/components-shared/Authenticate.svelte` in this repo)

### Other errors noticed in console (lower priority)
- `https://use.typekit.net/aba0ebl.css` blocked by Stake's CSP — proxima-nova font won't load, fallback used
- `/api/teams/vortex-global/approvals/cosmic-rush` returns 404 — Stake internal approval check, not blocking

---

## Build Instructions
```
# Edit source in:
C:/Users/.../star-gazing-handoff/star-gazing/src/

# Copy to dev server after each change:
cp <handoff>/src/... <devserver>/src/...
# devserver = C:/Users/.../SlotMachine-Design-Pipeline/engines/web-sdk/apps/star-gazing/

# Build:
cd engines/web-sdk/apps/star-gazing
npm run build

# Copy output to submission folder:
cp -r build/_app   Cosmic_Rush_Front/_app
cp build/index.html Cosmic_Rush_Front/index.html
cp build/favicon.png Cosmic_Rush_Front/favicon.png
```

## Submission Folder
`C:/Users/dpatt/Desktop/Cosmic_Rush_Front` — upload this to Stake Engine
