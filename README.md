# FreshCheck

**Scan It, Track It, Keep It Fresh.** A QR-based food storage tracker for containers, built in this existing React project. Add a food, save it to Firestore, print its stable QR label, and scan with a normal phone camera to see current time-based storage guidance. **Less Waste, More Freshness.**

## Stack and architecture
React 19, TypeScript (strict), Vite 8, React Router 7, Firebase 13 (Firestore, Authentication and Hosting), qrcode.react 4, Lucide, plain CSS. Dependencies remain in package.json/package-lock.json. Pages render UI; `services/foodService.ts` alone reads/writes food documents; `utils/freshness.ts` owns date arithmetic and validation; `hooks/useToday.ts` refreshes the calendar date. Brand and QR components are replaceable. Routes split heavy Firebase/QR code away from the homepage.

```text
src/
  assets/food-containers.svg
  components/{Brand,Navbar,FoodCard,FreshnessBadge,OrganizerAccess,QRLabel}.tsx
  config/firebase.ts
  hooks/useToday.ts
  pages/{HomePage,AddFoodPage,FoodListPage,FoodDetailsPage,NotFoundPage}.tsx
  services/foodService.ts
  types/food.ts
  utils/freshness.ts
  App.tsx, main.tsx, index.css
tests/freshness.test.mjs
DESIGN.md
FRESHCHECK_IMPLEMENTATION_REPORT.txt
firebase.json, firestore.rules, firestore.indexes.json
```

## Local setup
Use Node 24+ (tests directly import TypeScript).

```sh
npm install
cp .env.example .env
npm run dev
npm run build
npm run lint
npm test
npm run preview
```

Fill `.env` locally; never commit it. Required variable names:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

All six variables are validated for presence/placeholder values at initialization. Missing configuration leaves the homepage usable and shows a friendly configuration error on data pages. Firebase web configuration is included in the browser build by design; database access must be protected by rules, not hidden client keys.

## Firebase setup and security
Use the existing Firebase project `freshcheck-a7622`. No database reset or collection migration is required. The committed rules replace the original temporary global public-write rule:

- Anyone can read `foods`, including list queries. Food names, dates and notes are public: do not enter private information.
- Only authenticated users whose UID has an `organizers/{uid}` document can create foods.
- Client updates and deletions are denied, including for organizers.
- Organizer documents and all other collections have no client access.
- Create rules restrict fields/types/lengths/period and require a server timestamp.

Before deploying the new rules, enable **Email/Password** in Firebase Authentication, create an organizer user in the Firebase console, copy that user's UID, and create `organizers/{uid}` in Firestore using the console (a simple `enabled: true` field is sufficient; membership is based on document existence). Add the deployed domain to Authentication's authorized domains. Sign in on Add Food. This is a deliberately small organizer gate; there is no public registration or role management UI. Check the UID carefully. Adding food creates `foods` naturally; do not manually seed or delete existing food records.

**No rules or site were deployed by this implementation. Existing deployed rules remain in effect until you deploy.** Deploying the new rules before organizer provisioning will prevent food creation. Calendar validity/future dates are checked by the client/service; the rules enforce date format but do not implement a full calendar parser. Before broad public production use, add App Check, monitoring, suitable quotas, pagination, and trusted-server validation if needed. Rules must be tested with the Firestore emulator before release.

## Data and freshness
A `foods/{id}` document has `name: string`, `storedDate: YYYY-MM-DD`, `recommendedDays: integer 1..365`, optional `notes: string`, and `createdAt: serverTimestamp()`. The ID comes from Firestore; a persisted status is never used. Existing records without createdAt remain listed. Invalid legacy fields result in an explicit data error; repair them through the console rather than silently assigning Fresh.

Calendar age is `max(0, todayDay - storedDay)`, using UTC representations of local calendar components to avoid DST errors. Today is the viewing device's local date. For period N, Fresh applies before `max(1, ceil(N * 0.7))`; Use Soon applies from that day through day N inclusive; Check Before Use applies after N. Remaining days = N - age. Existing future dates clamp to age zero, while new future dates are rejected. Open food pages update every 30 seconds and on window focus.

This is storage guidance, not a food-safety determination. Recommended days are entered by the organizer, not sourced automatically from food-safety recommendations. Consider actual handling, refrigeration, appearance and smell. Never represent exhibition date examples as actual storage history.

## Routes and QR workflow
`/` home; `/add-food` organizer form; `/foods` public searchable/filterable list; `/food/:id` public guidance and QR; all other routes show 404. Invalid IDs and missing records show Food not found; network/permission/data errors are separate.

Save & Generate QR creates the document and navigates to `/food/:id`. QR encodes `${window.location.origin}/food/${id}`. Download QR saves a 720px PNG with a quiet zone. Print QR label uses the browser print dialog; it prints the food name, brand, QR and instruction, with no changing status. Keep labels at least several centimeters wide and test the actual print with a phone. PNG is QR-only; branded labels use Print.

## Exhibition preparation and deployment

```sh
firebase login
npm install
npm run lint
npm test
npm run build
firebase deploy --project freshcheck-a7622
```

Run only when authorized to deploy. Firebase Hosting serves `dist` with `** -> /index.html` for direct scans. `firebase.json` also points to the committed Firestore rules/indexes. Build immediately before deployment. Verify organizer setup before deploying rules.

On the deployed HTTPS origin, sign in and add Grapes, Cut Carrots and Boiled Eggs separately with truthful dates and appropriate recommended periods. For clearly labeled demonstration records only, a seven-day period and ages of 1, 5 and 8 days illustrate the three states. These examples are algorithm inputs, not food-specific recommended shelf lives. Do not alter code to force a status. Print one label for each container. Scan each with a signed-out phone on mobile data, verify the food and dates, and reload its direct URL. A localhost QR cannot be opened by another phone; regenerate labels after deployment. If hostname changes, reprint labels. Existing records remain unchanged.

## Verification and limits
Build, lint, deterministic freshness tests and Chrome fixture-based responsive checks are documented in `FRESHCHECK_IMPLEMENTATION_REPORT.txt`. Browser fixture tests do not prove live Firebase authentication, creation, rules enforcement, real QR optical readability or physical printing. Those require the configured organizer account, deployed rules, and actual phones/printer. No production records were written during testing. Firebase shared code still triggers Vite's 500kB chunk advisory; homepage initial JS is split from data pages.

## Theme and navigation
Use the sun/moon button in the header to switch themes. FreshCheck starts with your device theme and remembers an explicit choice in browser storage. QR codes and printed labels stay white for scanning. On pages other than the landing page, the Back button sits at the left above the page content. It returns to the previous page within the current app history; direct QR entries fall back to Home.
