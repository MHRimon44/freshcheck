# FreshCheck

**Scan It, Track It, Keep It Fresh.** A QR-based food storage tracker for containers, built in this existing React project. Add a food, save it to Firestore, print its stable QR label, and scan with a normal phone camera to see current time-based storage guidance. **Less Waste, More Freshness.**

## Stack and architecture

React 19, TypeScript (strict), Vite 8, React Router 7, Firebase 13 (Firestore, Authentication and Hosting), qrcode.react 4, Lucide, plain CSS. No new runtime dependencies.

`context/AuthContext.tsx` owns the single Firebase Auth listener and persistent session; `hooks/useAuth.ts` provides typed access. `services/userService.ts` manages private profiles. `services/foodService.ts` handles individual public reads, authenticated owner queries/creation and owner-verified deletion transactions. `utils/freshness.ts` retains calendar-safe dynamic guidance. See `DESIGN.md` for the design and `FRESHCHECK_IMPLEMENTATION_REPORT.txt` for the complete current state.

```text
src/
  assets/food-containers.svg
  components/{Brand,Navbar,BackButton,ThemeToggle,FoodCard,FreshnessBadge,QRLabel,ProtectedRoute,ProfileNotice}.tsx
  config/firebase.ts
  context/{AuthContext.tsx,authState.ts}
  hooks/{useAuth,useToday}.ts
  pages/{HomePage,AuthPage,ProfilePage,AddFoodPage,FoodListPage,FoodDetailsPage,NotFoundPage}.tsx
  services/{foodService,userService}.ts
  types/food.ts
  utils/{freshness,auth,ownership}.ts
  App.tsx, main.tsx, index.css
tests/auth-ownership.test.mjs
tests/freshness.test.mjs
tests/rules/firestore.test.mjs
tests/browser/multi-user.mjs
firebase.json, firebase.emulators.json, firestore.rules, firestore.indexes.json
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
VITE_USE_FIREBASE_EMULATORS (optional, development only; false by default)
```

All six variables are validated for presence/placeholder values at initialization. Missing configuration leaves the homepage usable and shows a friendly configuration error on data pages. Firebase web configuration is included in the browser build by design; database access must be protected by rules, not hidden client keys.

## Firebase setup and security

Keep the existing Firebase project `freshcheck-a7622`. Email/Password Authentication is already in use; confirm it remains enabled, the deployed domain is authorized, and the password policy is appropriate. No new provider or project is required. There is no need to add normal users to the organizers allowlist.

- Sign Up requests name, email, password and confirmation. Passwords use Firebase Auth, never Firestore. Client validation requires 8–128 characters; Firebase's configured policy is authoritative.
- Sign In restores the user's session using explicit browser-local persistence. Private routes wait for initial auth loading before redirecting.
- Sign Out is available as a red button in the account menu. Password changes are available only while signed in through My Profile; no Forgot Password page or recovery link is provided.
- Registration creates `users/{uid}` with `uid`, `displayName`, `email` and server `createdAt`. Only that user can get/create/update the profile, with a fixed schema and immutable uid/createdAt. Listing profiles is denied.
- New `foods` include authenticated `ownerId`. Creation requires `ownerId == request.auth.uid`, constrained fields and server timestamps. Only matching owner queries are allowed; global collection listing is denied, even for authenticated users.
- Individual food gets remain public for QR scanning, including legacy foods. All document fields are available to anyone with a food ID, including notes and technically ownerId through the API. The UI never renders ownerId or an owner's profile/email. Treat food fields as public.
- Food updates remain denied. Owners may delete their own food from My Foods after confirmation; anonymous users, other users and clients viewing unowned legacy records cannot delete them. Organizer membership remains console/Admin-only and grants no extra client permissions in this version. It is never assigned by registration.

**Rules were changed locally, not deployed.** The previous organizer-only rules will reject new normal-user writes/profile creation until these new rules are deployed. Deploy current Hosting and Firestore rules as a coordinated release. A successful Auth registration cannot be atomic with a Firestore profile write: if profile saving fails, the account is retained, a retry notice is shown, and signing in later retries profile creation without replacing existing data. No accounts or records are deleted as compensation.

Rules validate storage date format; semantic calendar/future-date checks remain in the service. Public data should contain no sensitive information. Use App Check, monitoring, quotas and a privacy policy for broader production use. Rules tests run against isolated local emulators, not the live project.

## Data and freshness

`foods/{id}`: `ownerId: string` on new records, `name: string`, `storedDate: YYYY-MM-DD`, `recommendedDays: integer 1..365`, optional public `notes: string`, `createdAt: serverTimestamp()`. The app's `Food.ownerId` stays optional for legacy reads; `FoodInput` excludes ownerId, id and timestamps. The service projects only expected fields and sources ownership directly from Auth. `users/{uid}` profiles and `organizers/{uid}` membership are separate collections; no client can grant itself organizer status.

Legacy records without ownerId retain document IDs and public QR access. They are not assigned to any user or included in My Foods. No migration ran. A future trusted-console/Admin migration may set ownerId only after verifying ownership and making a backup; keep IDs unchanged to preserve QR URLs. Records missing createdAt still work; owned list sorting uses timestamps locally after the owner-filtered query.

The freshness algorithm is unchanged: age = `max(0, todayDay - storedDay)` using UTC representations of the viewer's local calendar dates. For N days, Fresh before `max(1, ceil(N * 0.7))`, Use Soon from that point through N inclusive, Check Before Use after N. Remaining = N - age. New future dates and invalid fields are rejected. Open pages refresh the date every 30 seconds and on focus.

FreshCheck provides storage guidance, not a food-safety determination. Recommended periods are user-entered, not authoritative food-specific recommendations. Consider handling, refrigeration, appearance and smell.

## Routes and QR workflow

| Route              | Access / purpose                                              |
| ------------------ | ------------------------------------------------------------- |
| `/`                | Public homepage                                               |
| `/sign-up`         | Name/email/password/confirmation registration                 |
| `/sign-in`         | Existing-account sign-in                                      |
| `/profile`        | Protected display-name and password settings                   |
| `/add-food`        | Protected creation form                                       |
| `/my-foods`        | Protected owner-filtered collection, search and status filter |
| `/foods`           | Compatibility redirect to `/my-foods`                         |
| `/food/:id`        | Public QR result for both new and legacy foods                |
| Other paths        | 404                                                           |

Signed-out protected visits redirect to Sign In and preserve the known intended destination. After login or registration, continue to Add Food or My Profile when requested, otherwise My Foods. Arbitrary redirect URLs are rejected. Initial session restoration is awaited before deciding to redirect. New users do not become organizers.

Save & Generate QR creates a food with the authenticated owner ID and opens `/food/{id}`. QR remains `${window.location.origin}/food/${id}` with no token, user UID or email. Download saves a 720px PNG named after the food, such as `freshcheck-grapes-qr.png` or `freshcheck-cut-carrots-qr.png`. Names are normalized, unsafe filename characters become hyphens, Unicode letters are preserved, and blank sanitized names fall back to `freshcheck-food-qr.png`; Print produces a white label with FreshCheck, food name, QR and “Scan to check freshness,” never a permanent calculated status. Signed-out scanners need no account. Notes include the visible warning: “Notes may be visible to anyone with this QR link.”

## Exhibition preparation and deployment

Keep existing organizer accounts and membership documents; they sign in normally and can create their own new foods. Their legacy foods do not appear in My Foods until assigned deliberately by a trusted administrator, but existing labels keep working.

```sh
firebase login
npm install
npm run lint
npm test
npm run test:rules
npm run build
firebase deploy --only firestore:rules,firestore:indexes,hosting --project freshcheck-a7622
```

Do not deploy until authorized. No deployment was performed during implementation. Hosting still serves `dist` with `** -> /index.html`. The owner query uses only equality on ownerId and local sorting, so the default single-field index is sufficient; no composite index was added.

After deployment verify Sign Up, profile creation, sign-in/reload/sign-out and two-user isolation on the real project. Test a signed-out phone scan of both an existing legacy QR and a newly created food. Use production HTTPS when generating final labels. Create Grapes, Cut Carrots and Boiled Eggs separately with truthful storage dates and suitable periods. Clearly fictional demonstration inputs of ages 1/5/8 days with a 7-day period illustrate the three states; they are not shelf-life advice. Reprint labels only if the origin changes; existing IDs were preserved.

## Verification and limits

`npm test` runs 12 unit tests (7 existing freshness tests plus 5 auth/ownership/profile-validation tests). `npm run test:rules` starts local Auth/Firestore emulators on a fake `demo-freshcheck` project and runs the dependency-free REST security suite (20 reported results, including its parent test). Java 21+ and Firebase CLI are required. It never connects to production. `firebase.emulators.json` is separate from deployment configuration.

Browser verification used real SDKs against the same emulators. Checks passed for registration/profile creation, owned-food creation and queries, two-user isolation, reload persistence, sign-out, protected-destination login, public new/legacy QR, `/foods` alias, 404, profile name synchronization, current-password verification and new-password sign-in. Deletion checks passed for cancellation, confirmed removal and the deleted QR’s not-found state. The removed recovery route returns 404. Responsive checks cover 320, 375, 390, 430, 768, 1024 and 1440px widths, including account-menu bounds and My Profile. The test is retained as `npm run test:browser`; it requires a separate local dev server configured for emulators, the emulators running, and a task-owned Chrome debugging page on port 9223. It creates disposable local accounts/data; no production account is used.

To run browser checks, start the emulators using `firebase emulators:start --only auth,firestore --project demo-freshcheck --config firebase.emulators.json`. In another terminal set `VITE_USE_FIREBASE_EMULATORS=true` and override `VITE_FIREBASE_PROJECT_ID=demo-freshcheck` plus the other `VITE_FIREBASE_*` fields with nonsecret demo placeholders, then run `npm run dev -- --host 127.0.0.1`. Never use a real project ID with emulator mode: the dev config explicitly rejects it. Start a dedicated Chrome profile in headless mode with `--remote-debugging-port=9223`, then run `npm run test:browser`. If Vite selects another port, set `FRESHCHECK_TEST_ORIGIN` to that loopback origin for the browser command. Stop local services afterward. Emulator mode is development-only and off by default.

Live production auth, deployed rules, physical printing/optical scans and a full accessibility audit remain release checks. Build and lint pass; Vite still reports the Firebase bundle-size advisory. Auth now initializes globally, so Firebase loads on the homepage as well. No production data was modified.

## Theme and navigation

Use the sun/moon button in the header to switch themes. FreshCheck starts with your device theme and remembers an explicit choice in browser storage. QR codes and printed labels stay white for scanning. On pages other than the landing page, the Back button sits at the left above the page content. It returns to the previous page within the current app history; direct QR entries fall back to Home.

The existing hosting-only shortcut below updates the website, but does not deploy the new ownership/profile rules. Use the coordinated command above for this architecture change.

```sh
npm run lint
npm test
npm run build
firebase deploy --only hosting
```


## My Profile
Open the account menu and choose **My Profile** (`/profile`). Update your display name with **Save Name**; Firebase Auth and your private `users/{uid}` profile are synchronized, and the navbar refreshes immediately. If profile syncing fails after Auth succeeds, the app explains the partial save and offers Retry profile setup.

Change your password by entering the current password, a new 8–128 character password, and confirmation. Firebase reauthenticates the current password before updating it; successful changes clear the password fields. Passwords never enter Firestore. This page requires sign-in and preserves `/profile` as the destination after login. Existing own-profile rules already permit the name update; no extra rule privileges are needed for profile name updates. The application has no Forgot Password link, recovery screen or reset-email action; password changes require the current password.


## Deleting foods
In **My Foods**, use the red **Delete Food** button beside **View details & QR**, then confirm. The item disappears only after Firestore confirms the transaction. Cancellation keeps it. This permanently removes that food, and its existing QR URL then shows Food not found. You can delete only foods owned by your account; unowned legacy records cannot be deleted by clients. Food editing remains unavailable. Deploy the updated `firestore.rules` with Hosting to enable owner deletion in production; no deployment was performed here.


## Troubleshooting permission errors
If food creation reports “Access was denied,” check that the deployed Firestore rules match this repository. Older organizer-only rules reject normal-user writes and the newer `ownerId` field, even when sign-in works. A Hosting-only deployment does not update Firestore authorization. To publish just the reviewed rules when authorized:

```sh
firebase deploy --only firestore:rules --project freshcheck-a7622
```

Refresh and sign in again afterward. This updates authorization, not existing food data. If the error persists, inspect Firebase project selection, authenticated session, active rules and request fields; the generic error alone does not prove which check failed.

My Foods is scoped to the creator’s UID using a Firestore equality query. Public QR access is separate: anyone with a food’s URL can read that food and its notes, but cannot enumerate everyone’s foods or delete another owner’s records.

## Latest change summary

See [FRESHCHECK_CHANGES_SINCE_LAST_REPORT.txt](FRESHCHECK_CHANGES_SINCE_LAST_REPORT.txt) for a short continuation report. The longer implementation report includes historical sections; its current follow-up notes and the source code take precedence over descriptions of features subsequently removed.


## Phone and tablet layout
The sticky header uses a compact two-row layout on smaller screens, with bounded account menus. Authentication forms, food details and QR panels stack at tablet breakpoints; phone cards use full-width actions and form controls have comfortable touch targets. Inputs use 16px text on phones to avoid iOS focus zoom. The desktop design, themes, QR links and print labels are preserved.
